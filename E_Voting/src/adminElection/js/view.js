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
    viewModal: null,
    winner: {},
    votes: {},
    totalVote: BigInt(0),

    // only admin can access this page
    checkAuth: async () => {
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getVoterAddress()
        console.log(await App.contract.admin())
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
        App.viewModal = new Modal($("#viewModal"))
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        await globalFunc.countWinner(globalFunc.bigNumberToNumber(App.totalCandidate))
        await globalFunc.loadContent()
        await globalFunc.calculate()
        await App.loadView()
    },

    /**
     * show the view modal
     * first load all the voters address and load the layout
     * then load the data into the layout and check if they are voted
     */
    loadView: async () => {
        $(".viewVoter").on("click", function () {
            App.viewModal.show()
        })

        var voters = await globalFunc.getVotersContract();
        var totalV = await voters.voterCount()
        var table = $(".viewBody:last-child")
        var len = $(".viewBody tr").length
        var address = []
        console.log(table)
        for (var i = 0; i < totalV; i++) {
            await voters.voterAddress(i).then(async function (add) {
                address.push(add)
                var className = "tableRow" + len
                table.append('<tr class="' + className + '"></tr > ')
                $('.' + className).load("subView.html")
                len++
            })
        }

        for (var x = 0; x < len; x++) {
            var isVote = await voters.isVoted(address[x], App.electionID)
            var voter = await voters.voters(address[x])
            var className = ".tableRow" + x

            $(className).find(".num").text(x + 1)
            $(className).find(".address").text(voter.account)
            $(className).find(".name").text(voter.name)
            $(className).find(".mail").text(voter.email)
            if (isVote) {
                $(className).find("input").attr("checked", true)
            }
        }
    }
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
