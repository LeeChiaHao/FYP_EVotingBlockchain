import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../style.css'
import '../css/results.css'

const App = {
    contract: null,
    address: null,
    electionID: null,
    totalCandidate: null,
    txnModal: null,
    reqModal: null,
    winner: {},
    votes: {},
    totalVote: BigInt(0),

    checkAuth: async () => {
        App.address = await solidity.getVoterAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },

    load: async () => {
        await solidity.headerCSS(".eResult")
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        solidity.navigate("resultList.html", "election", true)

        App.txnModal = solidity.txnModal()
        App.reqModal = solidity.reqModal()
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        await App.countWinner(solidity.bigNumberToNumber(App.totalCandidate))
        await App.loadContent()
        await App.calculate()

    },

    calculate: async () => {
        $(".results").hide()
        App.txnModal.show()
        solidity.txnLoad("Calculating Result")
        setTimeout(function () {

            $('.modalTitle').text("Vote Result")
            $(".modalBody").html(`<p> There are total of ` + App.totalCandidate +
                ` candidates in this election.</p> <p> 
            At the end, we have <span class="fs-3">` + Object.keys(App.winner).length + ` Winner(s)</span>  in this election.</p>`)
            $(".modalBtn").text("View result")
            $(".modalBtn").on("click", () => {
                App.txnModal.hide()

                App.reqModal.hide()
                $(".results").show()
            })

            App.reqModal.show()
        }, 10)

    },

    countWinner: async (candidates) => {
        var max = 0
        for (var x = 0; x < candidates; x++) {
            await App.contract.electionCandidate(App.electionID, x).then((val) => {
                var vote = solidity.decrypt(BigInt(val.voteGet))
                App.totalVote += vote
                App.votes[x] = vote
                if (vote > max) {
                    max = vote
                }
            })
        }

        for (const e in App.votes) {
            if (App.votes[e] == max) {
                App.winner[e] = max
            }
        }
        console.log(1 in App.winner);
    },

    loadContent: async () => {
        var othersClass = "col-lg-5 border-0 p-0 mb-5"
        var winnerClass
        var len = Object.keys(App.winner).length
        if (len > 1) {
            winnerClass = "col-lg-5 border-0 mb-4"
        } else {
            winnerClass = "col-lg-12 border-0 mb-4"
            $(".winnerCandidates").addClass("justify-content-center")
            $(".winnerCandidates").removeClass("justify-content-between")
        }
        if (len == App.totalCandidate) {
            $(".others").addClass("d-none")
        }
        for (var x = 0; x < App.totalCandidate; x++) {
            if (x in App.winner) {
                $("<div></div").addClass(winnerClass + " candidate" + x).appendTo(".winnerCandidates")
            } else {
                $("<div></div").addClass(othersClass + " candidate" + x).appendTo(".othersCandidates")
            }
            $(".candidate" + x).prop("id", x)
            $(".candidate" + x).load("result.html")
        }

        var elec = await App.contract.elections(App.electionID)
        $(".elecName").text("Election Name: " + elec.name)
        await App.loadContentData()
    },

    loadContentData: async () => {
        for (var x = 0; x < App.totalCandidate; x++) {
            await App.contract.electionCandidate(App.electionID, x).then((val) => {
                var candidate = ".candidate" + x
                console.log(candidate);
                if (x in App.winner) {
                    $(candidate).find(".card").addClass("winnerCard")
                }
                $(candidate).find(".otherCandidate").text("Candidate " + (x + 1))
                $(candidate).find(".candidateName").text(val.name)
                $(candidate).find(".candidateAge").text(val.age)
                $(candidate).find(".candidateGender").prop("src", val.gender + ".png")

                $(candidate).find(".candidateParty").text(val.party)
                $(candidate).find(".candidateSlogan").text(val.slogan)
                var percent = Number(App.votes[x]) / Number(App.totalVote)
                $(candidate).find(".votePercent").text(percent * 100 + "% of votes obtained")
                $(candidate).find(".voteNumber").text("Get " + App.votes[x] + " vote(s)")
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