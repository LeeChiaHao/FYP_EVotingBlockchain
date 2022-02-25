import { ethers } from 'ethers'
import '../../style.css'
import '../css/historyList.css'

const App = {
    contract: null,
    address: null,
    timestamp: [],
    timeID: {},
    // only registered voters can access
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    // load all the content of key object
    load: async () => {
        await globalFunc.headerCSS(".vHistory")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        await globalFunc.navigate("/", "Signature2", false)
        await App.sortDesc()
        await App.loadHistory()
    },

    // sort the voter voted time descending so the latest vote will show at upmost
    sortDesc: async () => {
        var totalE = await App.contract.totalElection()
        for (var x = 0; x < totalE; x++) {
            await App.contract.elections(x).then(async (election) => {
                if (election.status == 2) {
                    var sign = await globalFunc.getSignature(App.address)
                    console.log(sign)
                    var verify = ethers.utils.verifyMessage(globalFunc.oriMsg(), sign)
                    console.log("Verify: " + verify);
                    await App.contract.verifyTimeID(x, sign).then(async (val) => {
                        if (val != "") {
                            var num = globalFunc.bigNumberToNumber(val)
                            await App.contract.provider.getBlockWithTransactions(num).then((data) => {
                                App.timestamp.push(data.timestamp)
                                App.timeID[data.timestamp] = x;
                            })
                        }

                    })
                }
            })
        }

        App.timestamp = App.timestamp.sort(function (a, b) { a - b })
        console.log("Timestamp: " + App.timestamp);
        console.log("Timestamp: " + App.timeID[App.timestamp[0]]);
        console.log(App.timestamp.length)
    },

    // load all the voted Election and a button event
    loadHistory: async () => {
        var elections = []
        var totalE = await App.contract.totalElection()
        var length = App.timestamp.length
        var className = "col-10 hList p-3 mb-5"
        for (var x = 0; x < length; x++) {
            var id = App.timeID[App.timestamp[x]]
            console.log(id);
            await App.contract.elections(id).then(async (e) => {
                console.log("Election" + e);
                var sign = await globalFunc.getSignature(App.address)
                await App.contract.encryptedVerify(id, sign).then((val) => {
                    if (val != "") {
                        $(".noList").addClass("d-none")
                        $("<div></div>").addClass(className + " election" + id).appendTo(".historyList")
                        $(".election" + id).prop("id", x)
                        $(".election" + id).load("history.html")
                    }
                })
            })
        }

        for (var x = 0; x < length; x++) {
            var id = App.timeID[App.timestamp[x]]

            await App.contract.elections(id).then((election) => {
                console.log(election)
                var time = globalFunc.utcToLocal(App.timestamp[x]).split(" ")
                $(".election" + id).find(".historyTitle").text((x + 1) + ". " + election.name)
                $(".election" + id).find(".text-muted").html("&nbsp;Voted at: " + time[0])
                $(".election" + id).find(".btn-verify").prop("id", id)
            })
        }

        $(".btn-verify").on("click", function () {
            console.log($(this).attr("id"))
            localStorage.setItem("election", $(this).attr("id"))
            window.location.assign("verify.html")
        })
        $(".container").removeClass("d-none")
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