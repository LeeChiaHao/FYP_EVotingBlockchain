import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../style.css'

const App = {
    contract: null,
    address: null,
    checkAuth: async () => {
        App.address = await solidity.getUserAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()

        await App.loadHistory()
    },

    loadHistory: async () => {
        var elections = []
        var totalE = await App.contract.totalElection()
        var className = "col-10 bg-primary p-3 mb-5"
        for (var x = totalE - 1; x >= 0; x--) {
            await App.contract.elections(x).then(async (election) => {
                if (election.status == 2) {
                    var sign = localStorage.getItem("Signature")
                    console.log(sign)
                    await App.contract.encryptedVerify(x, sign).then((val) => {
                        if (val != "") {
                            $(".noList").addClass("d-none")
                            console.log(election)
                            $("<div></div>").addClass(className + " election" + x).appendTo(".historyList")
                            $(".election" + x).prop("id", x)
                            $(".election" + x).load("history.html")
                            elections.push(x)
                        }
                    })

                }
            })
        }
        var count = 1
        for (var x = 0; x < elections.length; x++) {
            var e = elections[x]
            console.log(elections[x])
            await App.contract.elections(e).then((election) => {
                console.log(election)
                $(".election" + e).find(".historyTitle").text(count++ + ". " + election.name)
                $(".election" + e).find(".btn-verify").prop("id", e)
            })
        }

        $(".btn-verify").on("click", function () {
            console.log($(this).attr("id"))
            localStorage.setItem("election", $(this).attr("id"))
            window.location.assign("verify.html")
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