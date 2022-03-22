import '../../style.css'
import '../css/admin.css'

const App = {
    contract: null,
    address: null,
    totalCandidate: null,
    delCandidate: null,
    electionID: null,
    form: null,
    txnModal: null,

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
     * load all the candidate information to view
     * load the add/del on click event
     */
    load: async () => {
        await globalFunc.headerCSS(".listing")
        App.form = document.querySelector("#editForm")
        App.electionID = localStorage.getItem("election")
        globalFunc.navigate("list.html", "election", true)
        App.txnModal = globalFunc.txnModal()
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        App.delCandidate = $('.delCandidate')

        App.loadCandidate(App.electionID, App.totalCandidate)
        App.loadAddDel()
        $("#modalClose").on("click", function () {
            window.location.replace("list.html")
        })
    },

    // load all the layout of candidate info
    loadCandidate: async (id, total) => {
        for (var x = 0; x < total; x++) {
            $("<div></div").addClass("loadCandidate" + x).appendTo(".loadCandidate")
            $(".loadCandidate" + x).load("createForm.html", async function () {
                App.loadCandidateClass(true, ".loadCandidate" + x, x)
            })

            if ((x + 1) == total) {
                App.loadCandidateData(id, x)
            }
        }
    },

    /**
     * when layout load, load the correct className to the layout
     * true means load from contract, false means add manually
     * the num will be different, when laod from contract means first loading
     * load when user add candidate then need to minus 1 to ensure the num is consistent with previous
     */
    loadCandidateClass: async (bool, className, num) => {
        if (!bool) {
            num--;
        }
        $(className).children().each(function (index) {
            $(this).children().each(function (y) {
                if ($(this).is("label")) {
                    if (bool) {
                        $(this).text("Candidate" + num)
                    } else {
                        $(this).text("Candidate" + (num + 1))

                    }
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

    // load all the data to the layout by finding using className
    loadCandidateData: async (id, total) => {
        var election = await App.contract.elections(id)
        $("#electionName").val(election.name)
        $("#description").val(election.desc)
        for (var x = 0; x <= total; x++) {
            await App.contract.electionCandidate(id, x).then((val) => {
                $(".loadCandidate" + x).find(".candidate-label").text("Candidate " + (x + 1))
                $(".loadCandidate" + x).find("#candidateName" + x).val(val.name)
                $(".loadCandidate" + x).find("#age" + x).val(val.age)
                $(".loadCandidate" + x).find("#gender" + x).find("." + val.gender).prop("checked", true)
                $(".loadCandidate" + x).find("#partyName" + x).val(val.party)
                $(".loadCandidate" + x).find("#slogan" + x).val(val.slogan)
            }
            )
        }
        $("#editForm :input").prop('disabled', true)
        if (election.status == 0) {
            $("#editBtn").prop('disabled', false)
        } else if (election.status == 1) {
            $(".noEdit").removeClass("d-none")
        }
    },

    // add/del candidate button event, will call the functions when add/del
    loadAddDel: async () => {
        $(".addCandidate").on("click", async function () {
            var divCandidate = "loadCandidate" + App.totalCandidate
            $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate")
            $("." + divCandidate).load("createForm.html", function () {
                App.loadCandidateClass(false, "." + divCandidate, App.totalCandidate)
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

    // del the candidate function, remove the last candidate from the page
    deleteCandidate: async (num) => {
        num--;
        if (num >= 0) {
            $(".loadCandidate" + num).empty()
            $(".loadCandidate" + num).remove()
            if ((num - 1) == (-1)) {
                App.delCandidate.addClass("d-none")
            }
        }
    },

    // When user want to edit, the save, del or cancel btn will show
    editForm: async () => {
        $("#editBtn").parent().addClass('d-none')
        $("#editForm :input").prop('disabled', false)
        $("#saveBtn, #delBtn, #cancelBtn, .addCandidate, .delCandidate").removeClass('d-none')
    },

    // save the election form function
    // validate the form - cannot empty and must have at least one candidate
    // Then, call the createElection function to make transaction
    submitForm: async () => {
        App.form.checkValidity()
        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0) {
            if (App.totalCandidate >= 1) {
                var allCandidates = []
                var index = 0;
                var votes;
                for (var i = 0; i < App.totalCandidate; i++) {
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
                    await App.contract.editElection(App.electionID, $("#electionName").val(), $("#description").val(), allCandidates).then(
                        (tx) => tx.wait().then(function () {
                            globalFunc.customMsg(true, "Election info updated successfully.")
                        })
                    )
                } catch (e) {
                    globalFunc.customMsg(false, "Election info updated failed.")
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

    // delete the whole election
    delForm: async () => {
        try {
            App.txnModal.show()
            globalFunc.txnLoad("Making Transaction")
            await App.contract.deleteElection(App.electionID, 1).then(
                (tx) => tx.wait().then(function () {
                    globalFunc.customMsg(true, "Election deleted successfully.")
                })
            )
        } catch (e) {
            globalFunc.customMsg(true, "Election deletion failed.")
        }
    },

    // cancel the edit 
    cancelForm: async () => {
        window.location.reload()
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