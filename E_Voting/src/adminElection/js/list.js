import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/admin.css'

const App = {
    contract: null,
    address: null,
    checkAuth: async () => {
        App.contract = await solidity.getElectionContract()
        App.address = await solidity.getUserAddress()
        console.log(await App.contract.admin())
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    load: async () => {
        App.contract = await solidity.getElectionContract()
        App.address = await solidity.getElectionAddress()
        var totalElection = solidity.bigNumberToNumber(await App.contract.totalElection())
        // have to check, if candidate = 0, means this election has been deleted
        console.log(totalElection)

        await App.loadElection(totalElection)
    },

    loadElection: async (total) => {
        var className = "col-lg-4 col-9 border-0 mb-5 electionCard"
        for (var x = 0; x < total; x++) {
            console.log(x)
            // if no candidate, means this election has been delete, so no need load new electionCard
            if (await App.contract.totalCandidate(x) == 0) {
                console.log("hi")
                continue
            }
            $("<div></div>").addClass(className + " election" + x).appendTo(".allElections")
            $(".election" + x).prop("id", x)
            $(".election" + x).load("election.html")
        }
        App.loadTitle(total)
    },

    loadTitle: async (num) => {
        for (var x = 0; x <= num; x++) {
            $(".election" + x).on("click", function () {
                console.log($(this).attr("id"))
                localStorage.setItem("election", $(this).attr("id"))
                window.location.assign("edit.html")
            })
            await App.contract.elections(x).then((val) => {
                $(".election" + x).find("h5").text(val)
                console.log(val)
            })
        }
    }
}



window.App = App;
window.addEventListener("load", async function () {
    App.checkAuth().then(function (result) {
        if (!result) {
            console.log("false")
            window.location.replace("/")
        } else {
            App.load()
            $('body').removeClass('invisible')
        }
    })
})