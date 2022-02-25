import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/admin.css'

const App = {
    contract: null,
    address: null,
    checkAuth: async () => {
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getVoterAddress()
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    load: async () => {
        await globalFunc.headerCSS(".listing")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        var totalElection = globalFunc.bigNumberToNumber(await App.contract.totalElection())
        // if election.status == 3 (ABORT), means this election has been deteted
        await App.loadElection(totalElection)
        globalFunc.caretOnClick(3)
        $(".initialE").addClass("show")
        $(".initial").find('.caret').removeClass("left")
        $(".initial").find('.caret').html("&#9656;")
    },

    loadElection: async (total) => {
        var className = "col-lg-5 col-9 border-0 mb-5 electionCard p-3"
        var elections = []
        for (var x = 0; x < total; x++) {
            console.log("Total" + x)
            var election = await App.contract.elections(x)
            // if no candidate, means this election has been delete, so no need load new electionCard
            if (election.status == 3) {
                continue
            }
            var e = ".election" + x
            var append
            console.log(election.status);
            switch (election.status) {
                case 0:
                    append = ".initialE"
                    break
                case 1:
                    append = ".ongoingE"
                    break
                case 2:
                    append = ".endE"
                    break
                default:
                    break
            }
            console.log(append)
            $(append).find(".noList").addClass("d-none")
            $(append).find(".list").removeClass("d-none")
            $("<div></div>").addClass(className + " election" + x).appendTo(append)
            $(e).prop("id", x)
            $(e).load("election.html")
            elections.push(x)
        }
        App.loadData(elections)
    },

    loadData: async (e) => {
        for (var x = 0; x < e.length; x++) {
            var election = ".election" + e[x]
            await App.contract.elections(e[x]).then((val) => {
                $(election).find(".electionTitle").text(val.name)
                $(election).find(".electionDesc").text(val.desc)
                if (val.startD != 0) {
                    $(election).find(".startD").text(globalFunc.utcToLocal(val.startD))
                }
                if (val.endD != 0) {
                    $(election).find(".endD").text(globalFunc.utcToLocal(val.endD))
                }
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
            })
            let status = $(election).parent().attr("id")
            let location
            if (status == "ongoingE" || status == "initialE") {
                location = "edit.html"
            } else {
                location = "view.html"
            }
            $(election + " .electionContent").on("click", function () {
                var id = $(this).parent().attr("id")
                localStorage.setItem("election", id)
                window.location.assign(location)
            })
        }
        App.startE()
        App.endE()
    },

    startE: async () => {
        $(".btn-start").on("click", async function () {
            globalFunc.txnModal().show()

            var eid = $(this).parent().attr("id")
            try {
                await App.contract.editStatus(eid, 1).then(
                    (tx) => tx.wait().then(function () {
                        globalFunc.customMsg(true, "Election Started Successfully")
                    })
                )
            } catch (e) {
                globalFunc.customMsg(false, "Transaction Fail. Election still maintain Init Status")
                console.log(e)
            }
            $("#modalClose").on("click", function () {
                window.location.reload()
            })
        })
    },

    endE: async () => {
        $(".btn-end").on("click", async function () {
            globalFunc.txnModal().show()

            var eid = $(this).parent().attr("id")
            try {
                await App.contract.editStatus(eid, 2).then(
                    (tx) => tx.wait().then(function () {
                        globalFunc.customMsg(true, "Election Ended Successfully")
                    })
                )
            } catch (e) {
                globalFunc.customMsg(false, "Transaction Fail. Election still maintain Init Status")
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