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
    tmpName: null,
    tmpEmail: null,
    editArea: null,
    submitArea: null,
    form: null,
    checkAuth: async () => {
        App.address = await solidity.getVoterAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        solidity.headerCSS(".profile")
        App.contract = await solidity.getVotersContract()
        App.address = await solidity.getVoterAddress()
        App.name = $("#profileName")
        App.email = $("#profileEmail")
        App.editArea = $("#editArea")
        App.submitArea = $("#submitArea")
        App.form = document.querySelector('.validation')
        await solidity.navigate("/", "Signature3", false)

        var voter = await App.contract.voters(App.address)
        console.log("Capital letter: " + App.address);
        App.name.val(voter.name)
        App.email.val(voter.email)
        console.log(voter.signature);

        $("#profileAddress").val(voter.account)
        App.myModal = new Modal($("#txnModal"))
        // Testing

        // await App.contract.verifySignature("0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be", await solidity.getSignature(App.address))
        //     .then(function (val) {
        //         console.log(val);
        //     });
        await App.contract.once("verifySigner", (hash, signer) => {
            console.log("Signer: " + signer)
            console.log("Signer: " + hash)

        })
    },

    editProfile: async () => {
        App.name.prop("disabled", false)
        App.email.prop("disabled", false)
        App.tmpName = App.name.val()
        App.tmpEmail = App.email.val()
        App.name.on("keyup", function () {
            App.checkChange(App.tmpName, App.tmpEmail)
            App.form.classList.remove('was-validated')
        })
        App.email.on("keyup", function () {
            App.checkChange(App.tmpName, App.tmpEmail)
            App.form.classList.remove('was-validated')
            $("#profileEmail").parent().find(".valid-feedback, .invalid-feedback").hide()

        })
        App.editArea.hide()
        App.submitArea.addClass("d-flex")
    },

    submitProfile: async () => {
        App.form.checkValidity()
        var emailValid = true
        if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#profileEmail").val())) {
            console.log("Wrong Email Cibai");
            emailValid = false
        }

        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0 && emailValid) {
            $("#profileEmail").parent().find(".valid-feedback").show()
            $("#profileEmail").parent().find(".invalid-feedback").hide()
            App.myModal.show()
            try {
                App.contract.voters[App.address] = await App.contract.editVoter(App.name.val(), App.email.val()).then(
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
        } else {
            if (!emailValid) {
                $("#profileEmail").parent().find(".valid-feedback").hide()
                $("#profileEmail").parent().find(".invalid-feedback").show()
            }

        }
    },

    cancelProfile: async () => {
        App.name.prop("disabled", true)
        App.email.prop("disabled", true)
        await App.name.val(App.tmpName)
        await App.email.val(App.tmpEmail)
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