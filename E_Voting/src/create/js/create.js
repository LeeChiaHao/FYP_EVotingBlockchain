import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/create.css'
import { bigNumberToNumber } from '../../global';

const App = {
    contract: null,
    address: null,
    totalCandidate: null,
    delCandidate: $(".delCandidate"),
    load: async () => {
        App.contract = await solidity.getElectionContract()
        App.address = await solidity.getElectionAddress()
        App.totalCandidate = 1;
        var divCandidate
        $(".addCandidate").on("click", async function () {
            if (App.totalCandidate == 1) {
                divCandidate = "loadCandidate" + App.totalCandidate
                $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate")
                $("." + divCandidate).load("candidate.html", function () {
                    App.loadClassName("." + divCandidate, App.totalCandidate)
                })
                App.totalCandidate++
                App.delCandidate.removeClass("d-none")

            } else {
                divCandidate = "loadCandidate" + App.totalCandidate
                $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate" + (App.totalCandidate - 1))
                $("." + divCandidate).load("candidate.html", function () {
                    App.loadClassName("." + divCandidate, App.totalCandidate)
                })
                App.totalCandidate++
            }
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
                    $(this).text("Candidate" + num)
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
                            $(this).prop("id", "partyName" + num)
                            break
                        case 4:
                            $(this).prop("id", "slogan" + num)
                            break
                        default:
                            break

                    }
                    // if (index == 1) {
                    //             $(this).prop("id", "candidateName" + num)

                    // }
                }
            })
            $(this).removeClass("candidate-group").addClass("candidate-group-" + num)
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
        var allCandidates = []
        console.log(App.totalCandidate)
        var index = 0;
        for (var i = 1; i < App.totalCandidate; i++) {
            allCandidates[index] = $("#candidateName" + i).val()
            index++;
            allCandidates[index] = $("#age" + i).val()
            index++;
            allCandidates[index] = $("#partyName" + i).val()
            index++;
            allCandidates[index] = $("#slogan" + i).val()
            index++;
        }
        console.log(allCandidates)
        App.contract.createElection($("#electionName").val(), allCandidates)
        await App.contract.once("electionInfo", (e, c) => {
            console.log(e + " ==== " + c)
        })

        var electionID = 0
        var totalCandidate = await App.contract.totalCandidate(electionID)
        console.log(totalCandidate)
        for (var i = 0; i < bigNumberToNumber(totalCandidate); i++) {
            var candidate = await App.contract.electionCandidate(electionID, i)
            console.log(candidate.id)
            console.log(candidate.name)
            console.log(candidate.age)
            console.log(candidate.party)
            console.log(candidate.slogan)
        }
        // console.log(candidate)

        // console.log(await App.contract.createCandidate(1, candidateID))
        // console.log(await App.contract.electionCandidate(1, 1))

    }

}


window.App = App;
window.addEventListener("load", async function () {
    App.load()
})