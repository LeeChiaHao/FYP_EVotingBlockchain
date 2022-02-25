import 'bootstrap'
import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
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
    checkAuth: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getVoterAddress()
        console.log(await App.contract.admin())
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    load: async () => {
        await solidity.headerCSS(".listing")
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        // solidity.navigate("list.html", "election", true)
        App.txnModal = solidity.txnModal()
        App.reqModal = solidity.reqModal()
        App.viewModal = new Modal($("#viewModal"))
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        await solidity.countWinner(solidity.bigNumberToNumber(App.totalCandidate))
        await solidity.loadContent()
        await solidity.calculate()
        await App.loadView()
    },

    loadView: async () => {
        $(".viewVoter").on("click", function () {
            App.viewModal.show()
        })

        var voters = await solidity.getVotersContract();
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
