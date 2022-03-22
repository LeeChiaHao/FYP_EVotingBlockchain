import '../../style.css'
import '../css/admin.css'

const App = {
    forms: null,
    contract: null,
    address: null,
    totalCandidate: null,
    txnModal: null,
    delCandidate: null,

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
     * load all content of key object 
     */
    load: async () => {
        await globalFunc.headerCSS(".creating")
        App.forms = document.querySelector('.validation')
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        App.txnModal = globalFunc.txnModal()
        App.delCandidate = $('.delCandidate')
        App.totalCandidate = 1;
        await App.addDelBtn()
    },

    // load on click event of add and del Candidate button, will load certain function to perform add/del
    addDelBtn: async () => {
        var divCandidate
        $(".addCandidate").on("click", async function () {
            divCandidate = "loadCandidate" + App.totalCandidate
            $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate")
            $("." + divCandidate).load("createForm.html", function () {
                App.loadClassName("." + divCandidate, App.totalCandidate)
            })
            App.totalCandidate++
            App.delCandidate.removeClass("d-none")
        })

        App.delCandidate.on("click", async function () {
            if (App.totalCandidate > 0) {
                App.deleteCandidate(App.totalCandidate)
                App.totalCandidate--;
            }
        })
    },

    // add candidate, assign proper id to all input elements and display to user
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

    // del candidate, del the last candidate info
    deleteCandidate: async (num) => {
        num--;
        if (num > 0) {
            $(".loadCandidate" + num).empty()
            $(".loadCandidate" + num).remove()
            if ((num - 1) == 0) {
                App.delCandidate.addClass("d-none")
            }
        }
    },

    // validate the form - cannot empty and must have at least one candidate
    // Then, call the createElection function to make transaction
    submitForm: async () => {
        App.forms.checkValidity()
        App.forms.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0) {
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
                    index++;
                    allCandidates[index] = $("#partyName" + i).val()
                    index++;
                    allCandidates[index] = $("#slogan" + i).val()
                    index++;
                    votes = globalFunc.encrypt(0).toString()
                    allCandidates[index] = votes
                    index++;
                }
                try {
                    App.txnModal.show()
                    globalFunc.txnLoad("Making Transaction")
                    var eid = globalFunc.bigNumberToNumber(await App.contract.totalElection())
                    await App.contract.createElection(eid, $("#electionName").val(), $("#description").val(), allCandidates).then(
                        (tx) => tx.wait().then(function () {
                            globalFunc.customMsg(true, "Election created successfully.")
                            $("#modalClose").on("click", function () {
                                window.location.replace("list.html")
                            })
                        })
                    )
                } catch (e) {
                    globalFunc.customMsg(false, "Election creation failed.")
                }

                // way of receive emitted event from contract
                // await App.contract.once("electionInfo", (e, c) => {
                //     console.log(e + " ==== " + c)
                // })
            } else {
                App.txnModal.show()
                globalFunc.customMsg(false, "Must have more than 1 candidate for an election")
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
