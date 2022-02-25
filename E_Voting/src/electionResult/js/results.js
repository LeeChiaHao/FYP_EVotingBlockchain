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
        await solidity.countWinner(solidity.bigNumberToNumber(App.totalCandidate))
        await solidity.loadContent()
        await solidity.calculate()
    },
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