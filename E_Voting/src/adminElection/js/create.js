import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/admin.css'
import { Modal } from 'bootstrap';
const App = {
    forms: null,
    contract: null,
    address: null,
    totalCandidate: null,
    txnModal: null,
    delCandidate: null,
    checkAuth: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getUserAddress()
        console.log(await App.contract.admin())
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    load: async () => {
        App.forms = document.querySelector('.validation')
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()
        App.txnModal = new Modal($("#txnModal"))
        App.delCandidate = $('.delCandidate')
        App.totalCandidate = 1;
        var divCandidate
        $(".addCandidate").on("click", async function () {
            console.log(App.totalCandidate)
            divCandidate = "loadCandidate" + App.totalCandidate
            $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate")
            $("." + divCandidate).load("createForm.html", function () {
                App.loadClassName("." + divCandidate, App.totalCandidate)
            })
            App.totalCandidate++
            console.log(App.delCandidate)

            App.delCandidate.removeClass("d-none")
        })

        App.delCandidate.on("click", async function () {
            if (App.totalCandidate > 0) {
                App.deleteCandidate(App.totalCandidate)
                App.totalCandidate--;
            }
        })
    },

    loadClassName: async (className, num) => {
        num--;
        $(className).children().each(function (index) {
            $(this).children().each(function (y) {
                if ($(this).is("label")) {
                    $(this).text("Candidate " + num)
                }
                if (y == 1) {
                    switch (index) {
                        case 1:
                            $(this).prop("id", "candidateName" + num)
                            break
                        case 2:
                            $(this).prop("id", "age" + num)
                            break
                        case 3:
                            $(this).prop("id", "gender" + num)
                            $(this).find("input").prop("name", "gender" + num)
                            break
                        case 4:
                            $(this).prop("id", "partyName" + num)
                            break
                        case 5:
                            $(this).prop("id", "slogan" + num)
                            break
                        default:
                            break
                    }
                }
            })
            $(this).removeClass("candidate-group").addClass("candidate-group-" + num)
            $(this).addClass("election-input-group")
        })
    },

    deleteCandidate: async (num) => {
        num--;
        if (num > 0) {
            console.log(".loadCandidate" + num)
            $(".loadCandidate" + num).empty()
            $(".loadCandidate" + num).remove()
            if ((num - 1) == 0) {
                App.delCandidate.addClass("d-none")
            }
        }
    },

    submitForm: async () => {
        // await App.validateForm()
        App.forms.checkValidity()
        App.forms.classList.add('was-validated')
        console.log($(".was-validated:invalid").length)
        if ($(".was-validated:invalid").length == 0) {
            console.log("Total Candidate: " + App.totalCandidate)
            if (App.totalCandidate > 1) {
                var allCandidates = []
                var index = 0;
                var votes;
                for (var i = 1; i < App.totalCandidate; i++) {
                    allCandidates[index] = $("#candidateName" + i).val()
                    index++;
                    allCandidates[index] = $("#age" + i).val()
                    index++;
                    allCandidates[index] = $("input[type='radio'][name='gender" + i + "']:checked").val()
                    console.log(allCandidates[index]);
                    index++;
                    allCandidates[index] = $("#partyName" + i).val()
                    index++;
                    allCandidates[index] = $("#slogan" + i).val()
                    index++;
                    votes = solidity.encrypt(0).toString()
                    allCandidates[index] = votes
                    index++;
                }

                console.log(allCandidates)
                try {
                    App.txnModal.show()
                    solidity.txnLoad("Making Transaction")
                    var eid = solidity.bigNumberToNumber(await App.contract.totalElection())

                    await App.contract.createElection(eid, $("#electionName").val(), allCandidates).then(
                        (tx) => tx.wait().then(function () {
                            solidity.txnSuccess()
                            $("#modalClose").on("click", function () {
                                window.location.replace("list.html")
                            })
                        })
                    )
                } catch (e) {
                    console.log(e)
                    solidity.txnFail()
                }

                // way of receive emitted event from contract
                await App.contract.once("electionInfo", (e, c) => {
                    console.log(e + " ==== " + c)
                })
            } else {
                App.txnModal.show()
                solidity.customMsg(false, "Must have more than 1 candidate for an election")
            }
        }


        // var electionID = 0
        // var totalCandidate = await App.contract.totalCandidate(electionID)
        // console.log(totalCandidate)
        // for (var i = 0; i < bigNumberToNumber(totalCandidate); i++) {
        //     var candidate = await App.contract.electionCandidate(electionID, i)
        //     console.log(candidate.id)
        //     console.log(candidate.name)
        //     console.log(candidate.age)
        //     console.log(candidate.party)
        //     console.log(candidate.slogan)
        // }

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
