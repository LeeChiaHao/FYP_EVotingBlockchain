import '../../style.css'
import '../css/resultList.css'

const App = {
    contract: null,
    address: null,
    txnModal: null,
    timestamp: [],
    timeId: {},
    // only registered voters can access
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    // load all the content of key object
    load: async () => {
        await globalFunc.headerCSS(".eResult")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        await globalFunc.navigate("/", "Signature1", false)
        App.txnModal = await globalFunc.txnModal()
        globalFunc.txnLoad("Loading")
        App.txnModal.show()
        var totalElection = globalFunc.bigNumberToNumber(await App.contract.totalElection())
        await App.loadElection(totalElection)
        setTimeout(function () {
            App.txnModal.hide()
        }, 500)

    },

    // load the elections layout
    loadElection: async (total) => {
        var className = "col-lg-4 col-9 border-0 mb-5 electionCard"
        for (var x = 0; x < total; x++) {
            console.log("Total" + total)
            if (await globalFunc.getCanVote(App.address, x)) {
                var election = await App.contract.elections(x)
                if (election.status == 2) {
                    console.log(election);
                    var time = globalFunc.bigNumberToNumber(election.endD)
                    console.log("End time: " + time);
                    console.log(typeof (time));
                    App.timestamp.push(time)
                    App.timeId[time] = x;
                }
            }

        }

        App.timestamp.sort(function (a, b) { return b - a })
        console.log(App.timestamp);
        var length = App.timestamp.length
        for (var x = 0; x < length; x++) {
            var id = App.timeId[App.timestamp[x]]
            var election = await App.contract.elections(id)
            $(".noList").addClass("d-none")
            $(".title").removeClass("d-none")
            $("<div></div>").addClass(className + " election" + id).appendTo(".allElections")
            $(".election" + id).prop("id", id)
            $(".election" + id).load("election.html")
        }
        await App.loadElectionData()
    },

    // load the data into layout
    loadElectionData: async () => {
        var len = App.timestamp.length
        for (var x = 0; x < len; x++) {
            var id = App.timeId[App.timestamp[x]]
            console.log("election" + id)
            $(".election" + id).on("click", function () {
                console.log($(this).attr("id"))
                localStorage.setItem("election", $(this).attr("id"))
                window.location.assign("results.html")
            })
            await App.contract.elections(id).then((val) => {
                var election = ".election" + id
                $(election).find(".electionTitle").text(val.name)
                $(election).find(".electionDesc").text(val.desc)
                $(election).find(".startD").text(globalFunc.utcToLocal(val.startD))
                $(election).find(".endD").text(globalFunc.utcToLocal(val.endD))

            })
        }
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