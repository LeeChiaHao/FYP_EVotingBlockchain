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
    txnModal: null,
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        await globalFunc.headerCSS(".vHistory")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        globalFunc.navigate("historyList.html", "election", true)
        App.reqModal = globalFunc.reqModal()
        App.txnModal = globalFunc.txnModal()

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
            App.reqModal.hide()
            App.txnModal.show()
            globalFunc.txnLoad("Verifying")
            await App.verifyVote()


        })
        $("#modalNo").text("Cancel")
        $("#modalNo").on("click", async function () {
            window.location.replace("historyList.html")
        })
    },

    verifyVote: async () => {
        var encrypted
        var signature = await globalFunc.getSignature(App.address)
        await App.contract.encryptedVerify(App.electionID, signature).then((val) => {
            console.log(val)
            encrypted = val
        })

        try {
            await ethereum.request({
                method: 'eth_decrypt',
                params: [encrypted, App.address],
            }).then(async (plain) => {
                App.reqModal.hide()
                console.log(plain)
                $(".historyCandidate").text(plain)
                try {
                    await App.contract.verifyTimeID(App.electionID, signature).then(async (val) => {
                        var num = globalFunc.bigNumberToNumber(val)
                        await App.contract.provider.getBlockWithTransactions(num).then((data) => {
                            var date = new Date(data.timestamp * 1000)
                            console.log(data)
                            console.log(date.toLocaleDateString("en-US"));
                            $(".historyTime").text(globalFunc.utcToLocal(data.timestamp))
                            console.log(data.transactions)
                            $(".historyTxn").text(data.transactions[0].hash)
                            $(".historyBlock").text("Block " + num + " (" + data.hash + ")")
                            globalFunc.customMsg(true, "Verify Success")
                            $(".main").show()
                        })
                    })
                } catch (e) {
                    globalFunc.customMsg(false, "Verify Failed")
                    $(".modalClose").on("click", function () {
                        window.location.replace("historyList.html")
                    })
                }

            })
        } catch (e) {
            globalFunc.customMsg(false, "Verify Failed")
            $(".modalClose").on("click", function () {
                window.location.replace("historyList.html")
            })
        }

    }
}

window.App = App;
window.addEventListener("load", async function () {
    $(".main").hide()
    App.checkAuth().then(function (result) {
        if (!result) {
            window.location.replace("/")
        } else {
            App.load()
            $('body').removeClass('invisible')
        }
    })
})