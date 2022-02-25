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

    // only registered voters can access
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    // load all the content of key object, then call the globalFunc to calculate and view the result
    load: async () => {
        await globalFunc.headerCSS(".eResult")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        globalFunc.navigate("resultList.html", "election", true)

        App.txnModal = globalFunc.txnModal()
        App.reqModal = globalFunc.reqModal()
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        await globalFunc.countWinner(globalFunc.bigNumberToNumber(App.totalCandidate))
        await globalFunc.loadContent()
        await globalFunc.calculate()
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