import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/create.css'
import '../css/edit.css'

const App = {
    contract: null,
    address: null,
    totalCandidate: null,
    delCandidate: null,
    checkAuth: async () => {
        App.contract = await solidity.getElectionContract()
        App.address = await solidity.getUserAddress()
        console.log(await App.contract.admin())
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },

    load: async () => {

        App.electionID = localStorage.getItem("election")
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        console.log("Candidates: " + App.totalCandidate)
        App.loadCandidate(App.electionID, App.totalCandidate)
        App.delCandidate = $('.delCandidate')
        $(".delCandidate").removeClass('d-none')

        $(".addCandidate").on("click", async function () {
            console.log(App.totalCandidate)
            var divCandidate = "loadCandidate" + App.totalCandidate
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
    loadCandidate: async (id, total) => {
        // var className = "col-lg-4 col-md-9 border-0 mb-5"
        for (var x = 0; x < total; x++) {
            $("<div></div").addClass("loadCandidate" + x).appendTo(".loadCandidate")
            // $(".candidate" + x).prop("id", x)

            $(".loadCandidate" + x).load("createForm.html", async function () {
                console.log("X: " + x)
                App.loadClassName(".loadCandidate" + x, x)
            })
            await App.contract.electionCandidate(id, x).then((val) => {
                console.log(val.name)
            })

            if ((x + 1) == total) {
                App.loadCandidateData(id, x)
            }
        }
    },
    loadClassName: async (className, num) => {
        console.log(className)
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
                }
            })
            $(this).removeClass("candidate-group").addClass("candidate-group-" + num)
        })
    },
    loadCandidateData: async (id, total) => {
        $("#electionName").val(await App.contract.elections(id))

        for (var x = 0; x <= total; x++) {
            console.log("X: " + x)
            await App.contract.electionCandidate(id, x).then((val) => {
                $(".loadCandidate" + x).find(".candidate-label").text("Candidate " + (x + 1))
                $(".loadCandidate" + x).find("#candidateName" + x).val(val.name)
                $(".loadCandidate" + x).find("#age" + x).val(val.age)
                $(".loadCandidate" + x).find("#partyName" + x).val(val.party)
                $(".loadCandidate" + x).find("#slogan" + x).val(val.slogan)
            }
            )
        }
        $("#editForm :input").prop('disabled', true)
        $(".btn-submit").prop('disabled', false)


    },
    deleteCandidate: async (num) => {
        num--;
        if (num >= 0) {
            console.log(".loadCandidate" + num)
            $(".loadCandidate" + num).empty()
            $(".loadCandidate" + num).remove()
            if ((num - 1) == (-1)) {
                App.delCandidate.addClass("d-none")
            }
        }
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