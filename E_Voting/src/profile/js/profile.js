import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/profile.css'
import { ethers } from 'ethers';
import { Modal } from 'bootstrap';

const App = {
    contract: null,
    address: null,
    loginID: null,
    myModal: null,
    name: null,
    email: null,
    editArea: null,
    submitArea: null,
    form: null,
    checkAuth: async () => {
        App.address = await solidity.getUserAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        App.contract = await solidity.getVotersContract()
        App.address = await solidity.getUserAddress()
        App.name = $("#profileName")
        App.email = $("#profileEmail")
        App.editArea = $("#editArea")
        App.submitArea = $("#submitArea")
        App.form = document.querySelector('.validation')

        var loginBN = await App.contract.voterID(App.address)
        App.loginID = ethers.BigNumber.from(loginBN).toNumber()
        var voter = await App.contract.voters(App.loginID)

        App.name.val(voter.name)
        App.email.val(voter.email)
        $("#profileAddress").val(voter.account)
        App.myModal = new Modal($("#popUpModal"))
    },

    editProfile: async () => {
        App.name.prop("disabled", false)
        App.email.prop("disabled", false)
        var tmpName = App.name.val()
        var tmpEmail = App.email.val()
        App.name.on("keyup", function () {
            App.checkChange(tmpName, tmpEmail)
        })
        App.email.on("keyup", function () {
            App.checkChange(tmpName, tmpEmail)
        })
        App.editArea.hide()
        App.submitArea.addClass("d-flex")
    },

    submitProfile: async () => {
        App.form.checkValidity()
        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0) {
            App.myModal.show()
            try {
                App.contract.voters[App.loginID] = await App.contract.editVoter(App.name.val(), App.email.val(), App.loginID).then(
                    (tx) => tx.wait().then(function () {
                        solidity.customMsg(true, "Transaction Success. Profile updated successfully.")
                    })
                )
            } catch (e) {
                solidity.customMsg(false, "Transaction Fail. Profile update failed.")
                console.log(e)
            }
            $("#modalClose").on("click", function () {
                window.location.reload()
            })
        }
    },

    cancelProfile: async () => {
        App.name.prop("disabled", true)
        App.email.prop("disabled", true)
        App.editArea.show()
        App.submitArea.removeClass("d-flex")
    },

    checkChange: async (name, email) => {
        if (name == App.name.val() && email == App.email.val()) {
            $("#submitBtn").prop("disabled", true)
        } else {
            $("#submitBtn").prop("disabled", false)
        }
    }
}

window.App = App;
window.addEventListener("load", async function () {
    App.checkAuth().then(function (result) {
        if (!result) {
            window.location.replace("/")
        } else {
            App.load()
            $('body').removeClass('invisible')
        }
    })
})