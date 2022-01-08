import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/profile.css'
// import img from 'success.png'
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
    checkAuth: async () => {
        App.address = await solidity.getUserAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },
    load: async () => {
        App.contract = await solidity.getUserContrat()
        App.address = await solidity.getUserAddress()
        App.name = $("#profileName")
        App.email = $("#profileEmail")
        App.editArea = $("#editArea")
        App.submitArea = $("#submitArea")

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

        App.editArea.hide()
        App.submitArea.addClass("d-flex")
    },

    submitProfile: async () => {
        App.myModal.show()
        try {
            App.contract.voters[App.loginID] = await App.contract.editVoter(App.name.val(), App.email.val(), App.loginID).then(
                (tx) => tx.wait().then(function () {
                    solidity.txnSuccess()
                })
            )
        } catch (e) {
            solidity.txnFail()
            console.log(e)
        }
        $("#modalClose").on("click", function () {
            window.location.reload()

        })


    },

    cancelProfile: async () => {
        App.name.prop("disabled", true)
        App.email.prop("disabled", true)
        App.editArea.show()
        App.submitArea.removeClass("d-flex")
    },


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
// $(window).on('beforeunload', function () {
//     return "Good bye";
// });