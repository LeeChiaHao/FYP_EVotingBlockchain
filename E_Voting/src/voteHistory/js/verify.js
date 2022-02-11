import 'bootstrap'
import { Modal } from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../style.css'
import '../css/verify.css'

const App = {
    contract: null,
    address: null,
    electionID: null,
    reqModal: null,
    checkAuth: async () => {
        App.address = await solidity.getUserAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        App.reqModal = new Modal($("#requestModal"))

        await App.showModal()
    },

    showModal: async () => {
        var elecName = await App.contract.elections(App.electionID)
        $(".elecName").text("Election Name: " + elecName.name)
        App.reqModal.show()
        $('.modalTitle').text("Verify Vote")
        $('.modalBody').html("<p>Please click the verify button below to verify your vote.<\p> <p>Please decrypt the message on pop-up window to verify</p><p>Do not share with others about your vote information.</p>")
        $(".modalBtn").text("Verify")
        $(".modalBtn").on("click", async function () {
            await App.verifyVote()
        })
    },

    verifyVote: async () => {
        var encrypted
        await App.contract.encryptedVerify(App.electionID, localStorage.getItem("Signature")).then((val) => {
            console.log(val)
            encrypted = val
        })

        await ethereum.request({
            method: 'eth_decrypt',
            params: [encrypted, App.address],
        }).then((plain) => {
            App.reqModal.hide()
            console.log(plain)
            $(".historyCandidate").text(plain)
        })
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