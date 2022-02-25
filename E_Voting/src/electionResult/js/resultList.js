import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../style.css'
import '../css/resultList.css'

const App = {
    contract: null,
    address: null,
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        await globalFunc.headerCSS(".eResult")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        await globalFunc.navigate("/", "Signature1", false)
        var totalElection = globalFunc.bigNumberToNumber(await App.contract.totalElection())
        await App.loadElection(totalElection)
    },

    loadElection: async (total) => {
        var className = "col-lg-4 col-9 border-0 mb-5 electionCard"
        var elections = []
        for (var x = 0; x < total; x++) {
            console.log("Total" + total)
            var election = await App.contract.elections(x)
            if (election.status == 2) {
                $(".noList").addClass("d-none")
                $(".title").removeClass("d-none")
                $("<div></div>").addClass(className + " election" + x).appendTo(".allElections")
                $(".election" + x).prop("id", x)
                $(".election" + x).load("election.html")
                elections.push(x)

            }
        }
        console.log(elections)
        await App.loadTitle(elections)
    },

    loadTitle: async (e) => {
        for (var x = 0; x < e.length; x++) {
            console.log("election" + e[x])
            $(".election" + e[x]).on("click", function () {
                console.log($(this).attr("id"))
                localStorage.setItem("election", $(this).attr("id"))
                window.location.assign("results.html")
            })
            await App.contract.elections(e[x]).then((val) => {
                var election = ".election" + e[x]
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