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
        App.address = await solidity.getVoterAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        await solidity.headerCSS(".vHistory")
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
        $('.modalBody').html(`<p>Please click the verify button below to verify your vote.</p> 
                        <p>Then, please decrypt the message on pop-up window to get the message.</p>
                        <p class='reqAlert'>Do not share with others about your vote information.</p>`)
        $(".sign").addClass("d-none")
        $(".option").removeClass("d-none")
        $("#modalYes").text("Verify")
        $("#modalYes").on("click", async function () {
            await App.verifyVote()
        })
        $("#modalNo").text("Cancel")
        $("#modalNo").on("click", async function () {
            window.location.replace("historyList.html")
        })
    },

    verifyVote: async () => {
        var encrypted
        var signature = await solidity.getSignature(App.address)
        await App.contract.encryptedVerify(App.electionID, signature).then((val) => {
            console.log(val)
            encrypted = val
        })

        await ethereum.request({
            method: 'eth_decrypt',
            params: [encrypted, App.address],
        }).then(async (plain) => {
            App.reqModal.hide()
            console.log(plain)
            $(".historyCandidate").text(plain)
            // TODO: electionID, signature
            await App.contract.verifyTimeID(App.electionID, signature).then(async (val) => {
                var num = solidity.bigNumberToNumber(val)
                await App.contract.provider.getBlockWithTransactions(num).then((data) => {
                    var date = new Date(data.timestamp * 1000)
                    console.log(data)
                    console.log(date.toLocaleDateString("en-US"));
                    $(".historyTime").text(solidity.utcToLocal(data.timestamp))
                    console.log(data.transactions)
                    $(".historyTxn").text(data.transactions[0].hash)
                    $(".historyBlock").text("Block " + num + " (" + data.hash + ")")
                })
            })
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