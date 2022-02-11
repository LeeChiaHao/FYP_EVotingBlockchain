import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../style.css'
import '../css/results.css'

const App = {
    contract: null,
    address: null,
    electionID: null,
    totalCandidate: null,
    winner: null,
    votes: {},
    totalVote: BigInt(0),
    checkAuth: async () => {
        App.address = await solidity.getUserAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()
        App.electionID = localStorage.getItem("election")

        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        await App.countWinner(solidity.bigNumberToNumber(App.totalCandidate))
        await App.loadContent()
    },

    countWinner: async (candidates) => {
        if (candidates == 1) {
            $(".others").addClass("d-none")
        }
        var max = 0
        for (var x = 0; x < candidates; x++) {
            await App.contract.electionCandidate(App.electionID, x).then((val) => {
                var vote = solidity.decrypt(BigInt(val.voteGet))
                App.totalVote += vote
                App.votes[x] = vote
                if (vote > max) {
                    max = vote
                    App.winner = x
                }
            })
        }
        console.log(App.winner + max.toString())
    },

    loadContent: async () => {
        $(".winnerCandidate").prop("id", "Candidate " + App.winner)
        $(".winnerCandidate").addClass("candidate" + App.winner)
        $(".winner").text(App.winner + 1)
        var className = "col-lg-5 border-0 p-0 mb-5"
        for (var x = 0; x < App.totalCandidate; x++) {
            if (x != App.winner) {
                $("<div></div").addClass(className + " candidate" + x).appendTo(".othersCandidates")
                $(".candidate" + x).prop("id", x)
                $(".candidate" + x).load("result.html")
            }
        }

        for (var x = 0; x < App.totalCandidate; x++) {
            await App.contract.electionCandidate(App.electionID, x).then((val) => {
                $(".candidate" + x).find(".otherCandidate").text("Candidate " + (x + 1))
                $(".candidate" + x).find(".candidateName").text(val.name)
                $(".candidate" + x).find(".candidateAge").text(val.age)
                $(".candidate" + x).find(".candidateParty").text(val.party)
                $(".candidate" + x).find(".candidateSlogan").text(val.slogan)
                var percent = Number(App.votes[x]) / Number(App.totalVote)
                $(".candidate" + x).find(".votePercent").text(percent * 100 + "%")
                $(".candidate" + x).find(".voteNumber").text(App.votes[x] + " votes")
            }
            )
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