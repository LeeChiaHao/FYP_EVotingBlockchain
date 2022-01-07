import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/candidate.css'

const App = {
    contract: null,
    address: null,
    electionID: null,

    load: async () => {
        App.contract = await solidity.getElectionContract()
        App.address = await solidity.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        console.log(localStorage.getItem("election"))

        var totalCandidate = await App.contract.totalCandidate(App.electionID)
        console.log("Candidates: " + totalCandidate)
        App.loadCandidate(App.electionID, totalCandidate)
    },

    loadCandidate: async (id, total) => {
        var className = "col-lg-4 col-md-9 border-0 mb-5"
        for (var x = 0; x < total; x++) {
            $("<div></div").addClass(className + " candidate" + x).appendTo(".allCandidates")
            $(".candidate" + x).prop("id", x)

            $(".candidate" + x).load("candidate.html")
            await App.contract.electionCandidate(id, x).then((val) => {
                console.log(val.name)


            })

            if ((x + 1) == total) {
                App.loadCandidateData(id, x)
            }
        }
    },

    loadCandidateData: async (id, total) => {
        for (var x = 0; x <= total; x++) {
            await App.contract.electionCandidate(id, x).then((val) => {
                $(".candidate" + x).find(".candidateID").text("Candidate " + (x + 1))
                $(".candidate" + x).find(".candidateName").text(val.name)
                $(".candidate" + x).find(".candidateAge").text(val.age)
                $(".candidate" + x).find(".candidateParty").text(val.party)
                $(".candidate" + x).find(".candidateSlogan").text(val.slogan)
            }
            )
        }
    },

}



window.App = App;
window.addEventListener("load", async function () {
    App.load()
})