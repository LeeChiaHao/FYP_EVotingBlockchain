import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/admin.css'

const App = {
    contract: null,
    address: null,
    checkAuth: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getUserAddress()
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    load: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()
        var totalElection = solidity.bigNumberToNumber(await App.contract.totalElection())
        // if election.status == 3 (ABORT), means this election has been deteted
        console.log(totalElection)
        await App.loadElection(totalElection)
    },

    loadElection: async (total) => {
        var className = "col-lg-4 col-9 border-0 mb-5 electionCard"
        var elections = []
        for (var x = 0; x < total; x++) {
            console.log("Total" + x)
            var election = await App.contract.elections(x)
            // if no candidate, means this election has been delete, so no need load new electionCard
            if (election.status == 3) {
                continue
            }
            $("<div></div>").addClass(className + " election" + x).appendTo(".allElections")
            $(".election" + x).prop("id", x)
            $(".election" + x).load("election.html")
            elections.push(x)
        }
        App.loadData(elections)
    },

    loadData: async (e) => {
        for (var x = 0; x < e.length; x++) {
            var election = ".election" + e[x]
            await App.contract.elections(e[x]).then((val) => {
                $(election).find("span").text(solidity.electionStatus(val.status))
                $(election).find("h5").text(val.name)
                switch (val.status) {
                    case 0:
                        $(election).find(".btn-start").removeClass("d-none")
                        break
                    case 1:
                        $(election).find(".btn-end").removeClass("d-none")
                        break
                    default:
                        break
                }
                console.log(val)
            })
            $(election + " .electionContent").on("click", function () {
                var id = $(this).parent().attr("id")
                console.log("ID:" + id)
                localStorage.setItem("election", id)
                window.location.assign("edit.html")
            })
        }
        $('.card-header').removeClass('d-none')
        App.startE()
        App.endE()
    },

    startE: async () => {
        $(".btn-start").on("click", async function () {
            solidity.txnModal().show()

            var eid = $(this).parent().attr("id")
            try {
                await App.contract.editStatus(eid, 1).then(
                    (tx) => tx.wait().then(function () {
                        solidity.customMsg(true, "Election Started Successfully")
                    })
                )
            } catch (e) {
                solidity.customMsg(false, "Transaction Fail. Election still maintain Init Status")
                console.log(e)
            }
            $("#modalClose").on("click", function () {
                window.location.reload()
            })

        })
    },

    endE: async () => {
        $(".btn-end").on("click", async function () {
            solidity.txnModal().show()

            var eid = $(this).parent().attr("id")
            try {
                await App.contract.editStatus(eid, 2).then(
                    (tx) => tx.wait().then(function () {
                        solidity.customMsg(true, "Election Started Successfully")
                    })
                )
            } catch (e) {
                solidity.customMsg(false, "Transaction Fail. Election still maintain Init Status")
                console.log(e)
            }
            $("#modalClose").on("click", function () {
                window.location.reload()
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