import '../../style.css'
import '../css/admin.css'

const App = {
    contract: null,
    address: null,
    voterModal: null,
    txnModal: null,
    // only admin can access this page
    checkAuth: async () => {
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getVoterAddress()
        App.voterModal = globalFunc.voterModal()
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    /**
     * load the content of key object
     * by default the initial election will be open
     * then call the load all election data function
     */
    load: async () => {
        await globalFunc.headerCSS(".listing")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        App.txnModal = globalFunc.txnModal()
        globalFunc.txnLoad("Loading")
        App.txnModal.show()
        var totalElection = globalFunc.bigNumberToNumber(await App.contract.totalElection())
        // if election.status == 3 (ABORT), means this election has been deteted
        await globalFunc.loadView(0, false)
        await globalFunc.onSearch()
        await App.loadElection(totalElection)
        globalFunc.caretOnClick(3)
        $(".initialE").addClass("show")
        $(".initial").find('.caret').removeClass("left")
        $(".initial").find('.caret').html("&#9656;")
    },

    // load all the layout of elections data, assign them by following their status
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
            $(append).find(".noList").addClass("d-none")
            $(append).find(".list").removeClass("d-none")
            $("<div></div>").addClass(className + " election" + x).appendTo(append)
            $(e).prop("id", x)
            $(e).load("election.html")
            elections.push(x)
        }
        App.loadData(elections)
    },

    // after layout loaded, load all the data
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
        App.txnModal.hide()
        App.eligible()
        App.endE()
    },

    // start the election function, election will be started if transaction success
    eligible: async () => {
        var len = $(".viewBody tr").length
        console.log(len)
        if (len != 0) {
            $(".vFooter").removeClass("d-none")
            var table = $(".viewBody:last-child")
            var className = "allowAll"
            table.append('<tr class="' + className + '"></tr > ')
            className = "." + className
            await $(className).load("subVoter.html", function () {
                $(className).find(".num").text("")
                $(className).find(".address").text("")
                $(className).find(".name").text("")
                $(className).find(".mail").text("")
                $(className).find("input").attr("name", "checkAll")
                $(className).find("input").attr("id", "checkAll")
                $(className).find("input").attr("disabled", false)
                $(className).find("input").attr("checked", true)
                $(className).find("label").attr("for", "checkAll")
                $(className).find("label").attr("class", "checkAll")
                $(className).find("label").text("Disallow All")
                console.log(len);
                $("#checkAll").on("change", function () {
                    if ($(this).is(":checked")) {
                        for (var i = 0; i < len; i++) {
                            var voter = "#voter" + i
                            if (!$(voter).is(":checked")) {
                                $(voter).trigger('click')
                            }
                        }
                        $(className).find("label").text("Disallow All")
                    } else {
                        for (var i = 0; i < len; i++) {
                            var voter = "#voter" + i
                            if ($(voter).is(":checked")) {
                                $(voter).trigger('click')
                            }
                        }
                        $(className).find("label").text("Allow All")
                    }
                })
            })
        }
        $(".btn-start").on("click", async function () {
            var elect = await App.contract.elections($(this).parent().attr("id"))
            $(".modal-title").text("Set Eligible voters for Election: " + elect.name)
            $(".modalBtn").attr("id", $(this).parent().attr("id"))
            App.voterModal.show()
        })
        await App.startE()
    },

    startE: async () => {
        $(".modalBtn").on("click", async function () {
            App.voterModal.hide()
            globalFunc.txnModal().show()
            globalFunc.txnLoad("Making Transaction")
            var eid = $(this).attr("id")
            var len = ($(".viewBody tr").length) - 1
            var voters = []

            for (var x = 0; x < len; x++) {
                var voter = "#voter" + x
                var row = ".tableRow" + x

                if ($(voter).is(":checked")) {
                    voters.push($(row).find('.address').text())
                }
            }

            if (voters.length == 0) {
                globalFunc.customMsg(false, "Must have at least 1 voter allow to vote")
            } else {
                console.log(voters);
                try {
                    await App.contract.editStatus(eid, 1, voters).then(
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
            }
        })
    },

    // end the election function, election will be ended if transaction success
    endE: async () => {
        $(".btn-end").on("click", async function () {
            globalFunc.txnModal().show()
            globalFunc.txnLoad("Making Transaction")

            var eid = $(this).parent().attr("id")
            try {
                await App.contract.editStatus(eid, 2, []).then(
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