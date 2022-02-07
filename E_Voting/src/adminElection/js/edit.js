import 'bootstrap'
import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
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
        App.form = document.querySelector("#editForm")
        App.electionID = localStorage.getItem("election")
        App.txnModal = new Modal($("#txnModal"))
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        App.delCandidate = $('.delCandidate')

        App.loadCandidate(App.electionID, App.totalCandidate)
        App.loadAddDel()
    },
    loadCandidate: async (id, total) => {
        for (var x = 0; x < total; x++) {
            $("<div></div").addClass("loadCandidate" + x).appendTo(".loadCandidate")

            $(".loadCandidate" + x).load("createForm.html", async function () {
                App.loadCandidateClass(true, ".loadCandidate" + x, x)
            })
            await App.contract.electionCandidate(id, x).then((val) => {
                console.log(val.name)
            })

            if ((x + 1) == total) {
                App.loadCandidateData(id, x)
            }
        }
    },

    loadAddDel: async () => {
        $(".addCandidate").on("click", async function () {
            console.log(App.totalCandidate)
            var divCandidate = "loadCandidate" + App.totalCandidate
            $("<div></div>").addClass(divCandidate).appendTo(".loadCandidate")
            $("." + divCandidate).load("createForm.html", function () {
                App.loadCandidateClass(false, "." + divCandidate, App.totalCandidate)
            })
            App.totalCandidate++
            console.log(App.delCandidate)
            App.delCandidate.removeClass("d-none")
        })

        App.delCandidate.on("click", async function () {
            if (App.totalCandidate > 0) {
                App.deleteCandidate(App.totalCandidate)
                App.totalCandidate--;
                console.log(App.totalCandidate)
            }
        })
    },

    // true means load from contract, false means add manually
    loadCandidateClass: async (bool, className, num) => {
        if (!bool) {
            num--;
        }
        console.log(className)
        $(className).children().each(function (index) {
            $(this).children().each(function (y) {
                if ($(this).is("label")) {
                    if (bool) {
                        $(this).text("Candidate" + num)
                    } else {
                        $(this).text("Candidate" + (num + 1))

                    }
                    // num--
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
            $(this).addClass("election-input-group")
        })
    },

    loadCandidateData: async (id, total) => {
        var election = await App.contract.elections(id)
        $("#electionName").val(election.name)
        for (var x = 0; x <= total; x++) {
            await App.contract.electionCandidate(id, x).then((val) => {
                $(".loadCandidate" + x).find(".candidate-label").text("Candidate " + (x + 1))
                $(".loadCandidate" + x).find("#candidateName" + x).val(val.name)
                $(".loadCandidate" + x).find("#age" + x).val(val.age)
                $(".loadCandidate" + x).find("#partyName" + x).val(val.party)
                $(".loadCandidate" + x).find("#slogan" + x).val(val.slogan)
                var vote = BigInt(val.voteGet)
                var add = solidity.encrypt(4)
                var total = solidity.encryptAdd(add, vote)
                // console.log(total)
                // console.log("Decryption: " + solidity.decrypt(total))
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

    editForm: async () => {
        $("#editBtn").parent().addClass('d-none')
        $("#editForm :input").prop('disabled', false)
        $("#saveBtn, #delBtn, #cancelBtn, .addCandidate, .delCandidate").removeClass('d-none')

    },

    submitForm: async () => {
        App.form.checkValidity()
        App.form.classList.add('was-validated')
        console.log($(".was-validated:invalid").length)
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
                    solidity.txnLoad()
                    await App.contract.editElection(App.electionID, $("#electionName").val(), allCandidates).then(
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
    },
    delForm: async () => {
        App.contract.deleteElection(App.electionID).then(
            (tx) => tx.wait().then(function () {
                window.location.replace("list.html")
            })
        )
    },
    cancelForm: async () => {
        window.location.reload()
    }
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