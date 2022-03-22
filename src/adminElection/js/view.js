import { Modal } from 'bootstrap';
import '../../style.css'
import '../css/admin.css'

const App = {
    contract: null,
    address: null,
    electionID: null,
    totalCandidate: null,
    txnModal: null,
    reqModal: null,
    voterModal: null,
    winner: {},
    votes: {},
    totalVote: BigInt(0),

    // only admin can access this page
    checkAuth: async () => {
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getVoterAddress()
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    /**
     * load all the content of key object
     * call count the winner, load the content and calculate modal
     * loadView is let admin see who have vote in this election
     */
    load: async () => {
        await globalFunc.headerCSS(".listing")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        // globalFunc.navigate("list.html", "election", true)
        App.txnModal = globalFunc.txnModal()
        App.reqModal = globalFunc.reqModal()
        App.voterModal = globalFunc.voterModal()
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        await globalFunc.countWinner(globalFunc.bigNumberToNumber(App.totalCandidate))
        await globalFunc.loadContent()
        await globalFunc.calculate()
        await globalFunc.loadView(App.electionID, true)
        await globalFunc.onSearch()
        $(".viewVoter").on("click", function () {
            App.voterModal.show()
        })
    },
}

window.App = App;
window.addEventListener("load", async function () {
    App.checkAuth().then(async function (result) {
        if (!result) {
            window.location.replace("/")
        } else {
            await App.load().then(() => {
                $('body').removeClass('invisible')

            })
        }
    })
})
