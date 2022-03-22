import '../../style.css'
import '../css/elections.css'

const App = {
    contract: null,
    address: null,
    txnModal: null,

    // only registered voters can access
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    /**
     * load all the content of key object
     * default the noVote will be show
     * then, load all the available elections
     */
    load: async () => {
        await globalFunc.headerCSS(".castVote")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        App.txnModal = await globalFunc.txnModal()
        globalFunc.txnLoad("Loading")
        App.txnModal.show()
        await globalFunc.navigate("/", "Signature0", false)
        var totalElection = globalFunc.bigNumberToNumber(await App.contract.totalElection())
        globalFunc.caretOnClick(2)
        $(".noVote").addClass("show")
        $(".noV").find(".caret").removeClass("left")
        $(".noV").find(".caret").html("&#9656;")
        await App.loadElection(totalElection)
        let sign = await globalFunc.getSignature(App.address)
        $(".resultClick").on("click", async function () {
            window.onbeforeunload = function () {
                window.onunload = function () {
                    localStorage.clear()
                    window.localStorage.setItem("Signature1", sign)
                }
            }
        })
    },

    // load all election's layout based on user voted or not
    loadElection: async (total) => {
        var className = "col-lg-5 col-9 border-0 my-4 electionCard"
        var elections = []
        for (var x = 0; x < total; x++) {
            var election = await App.contract.elections(x)
            if (election.status == 1) {
                var append
                var e = ".election" + x
                if (await globalFunc.getCanVote(App.address, x)) {
                    await App.contract.encryptedVerify(x, await globalFunc.getSignature(App.address)).then((val) => {
                        if (val != "") {
                            append = ".voted"
                        } else {
                            append = ".noVote"
                        }
                        $(append).find(".noList").addClass("d-none")
                        $(append).find(".list").removeClass("d-none")

                        $("<div></div>").addClass(className + " election" + x).appendTo(append)
                        $(e).prop("id", x)
                        $(e).load("election.html")
                        elections.push(x)
                    })
                }
            }
        }
        await App.loadTitle(elections)
    },

    // Then, load the data to the layout
    loadTitle: async (e) => {
        for (var x = 0; x < e.length; x++) {
            $(".election" + e[x]).on("click", function () {
                localStorage.setItem("election", $(this).attr("id"))
                window.location.assign("candidates.html")
            })
            await App.contract.elections(e[x]).then((val) => {
                var election = ".election" + e[x]
                $(election).find(".electionTitle").text(val.name)
                $(election).find(".electionDesc").text(val.desc)
                $(election).find(".startD").text(globalFunc.utcToLocal(val.startD))
                if (val.endD != 0) {
                    $(election).find(".endD").text(globalFunc.utcToLocal(val.endD))
                }
            })
        }
        setTimeout(function () {
            App.txnModal.hide()
        }, 500)
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