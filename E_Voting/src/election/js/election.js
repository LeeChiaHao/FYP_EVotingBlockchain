import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/election.css'

const App = {
    contract: null,
    address: null,

    load: async () => {
        App.contract = await solidity.getElectionContract()
        App.address = await solidity.getElectionAddress()
        var totalElection = solidity.bigNumberToNumber(await App.contract.totalElection())
        console.log(totalElection)

        await App.loadElection(totalElection)
    },

    loadElection: async (total) => {
        var className = "col-lg-4 col-9 border-0 mb-5 electionCard"
        for (var x = 0; x < total; x++) {
            console.log(x)
            $("<div></div>").addClass(className + " election" + x).appendTo(".allElection")
            $(".election" + x).prop("id", "election" + x)
            $(".election" + x).load("election.html", function () {
                App.loadTitle(x)

            })
        }
        // App.loadTitle(total)
    },

    loadTitle: async (num) => {
        // console.log($(".election" + num).find(".electionTitle").text("Elections " + (num++)))

        for (var x = 0; x < num; x++) {
            $(".election" + x).find("h5").text("Election " + (x + 1))
            $(".election" + x).on("click", function () {
                console.log($(this).attr("id"))
                localStorage.setItem("election", $(this).attr("id"))
            })
        }

    }
}

window.App = App;
window.addEventListener("load", async function () {
    App.load()
})