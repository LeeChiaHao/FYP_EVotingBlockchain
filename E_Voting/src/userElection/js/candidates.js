import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ethers } from 'ethers'
import '../../style.css'
import '../css/candidate.css'
import { Modal } from 'bootstrap';
import { encrypt } from '@metamask/eth-sig-util'

const App = {
    contract: null,
    address: null,
    electionID: null,
    voted: null,
    totalCandidate: null,
    reqModal: null,
    checkAuth: async () => {
        App.address = await solidity.getUserAddress()
        var isAuth = await solidity.isAuth(App.address)
        return isAuth
    },
    load: async () => {
        App.contract = await solidity.getElectionsContract()
        App.address = await solidity.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        App.reqModal = new Modal($("#requestModal"))
        console.log(localStorage.getItem("election"))

        App.totalCandidate = await App.contract.totalCandidate(App.electionID)
        console.log("Candidates: " + App.totalCandidate)
        App.loadCandidate(App.electionID, App.totalCandidate)
        await App.onclickModal()

        $("#btn-confirm").on("click", async (e) => {
            e.preventDefault()
            e.stopImmediatePropagation()
            await App.submitVote()
        })
    },

    loadCandidate: async (id, total) => {
        var className = "col-lg-4 col-md-9 border-0 mb-5"
        for (var x = 0; x < total; x++) {
            $("<div></div").addClass(className + " candidate" + x).appendTo(".allCandidates")
            $(".candidate" + x).prop("id", x)

            $(".candidate" + x).load("candidate.html")
            await App.contract.electionCandidate(id, x).then((val) => {
                console.log(val.name)
            })

            if ((x + 1) == total) {
                App.loadCandidateData(id, x)
            }
        }
    },

    loadCandidateData: async (id, total) => {
        for (var x = 0; x <= total; x++) {
            await App.contract.electionCandidate(id, x).then((val) => {
                $(".candidate" + x).find(".candidateID").text("Candidate " + (x + 1))
                $(".candidate" + x).find(".candidateName").text(val.name)
                $(".candidate" + x).find(".candidateAge").text(val.age)
                $(".candidate" + x).find(".candidateParty").text(val.party)
                $(".candidate" + x).find(".candidateSlogan").text(val.slogan)
            }
            )
        }
        $(".candidateCard").on("click", function () {
            $(".candidateCard").removeClass("active")
            $(this).addClass("active")
            App.voted = $(this).parent().attr("id")
            console.log(App.voted)
        })
    },

    submitVote: async () => {
        // var e = await App.contract.encryptedVerify(0, "0x5aabd9d81fda3bb28b568942107729be9a14b8e5e0823ee57934ba8c5a6940ec1521f1308ec16578c9a9d84aa1fcb0bc837ae6e130e280d162d204640d0182f81c")
        //     .then(async (val) => {
        //         console.log(val)
        //         // var plain = await ethereum.request({
        //         //     method: 'eth_decrypt',
        //         //     params: [val, App.address],
        //         // })
        //         // console.log("Decrpted: " + plain)
        //     })

        if (App.voted != null) {
            App.requestModal()
        }
    },

    requestModal: async () => {
        $(".sign").addClass("d-none")
        $(".option").removeClass("d-none")
        App.reqModal.show()
        $('.modalTitle').text("Voting Confirmation")
        $('.modalBody').html("<p>Are you sure you want to vote to: <\p> <h4 class='text-center'> Candidate " + (parseInt(App.voted) + 1) + "<\h4>")
    },

    onclickModal: async () => {
        $("#modalYes").on("click", async function () {
            App.reqModal.hide()
            solidity.txnModal().show()
            solidity.txnLoad("Requesting Encryption Key")
            var signature = localStorage.getItem("Signature")
            console.log("Twiceeee whyyy")
            var encrypt
            await App.requestEncrypt().then(async (re) => {
                encrypt = re
                console.log("Encrypt: " + encrypt)
                if (encrypt != null) {
                    console.log("Don't Enter");
                    solidity.txnLoad("Making Transaction")
                    var voteGet = await App.setVoteGet()
                    console.log(App.electionID + signature + encrypt + voteGet)
                    try {
                        await App.contract.addVote(App.electionID, signature, encrypt, voteGet).then(
                            (tx) => tx.wait().then(() => {
                                solidity.txnSuccess()
                            })
                        )
                    } catch (e) {
                        console.log(e)
                        solidity.txnFail()
                    }
                } else {
                    console.log("Key Failed")
                }
            })
        })

        $("#modalNo").on("click", async function () {
            App.reqModal.hide()
        })

        $("#modalClose").on("click", async function () {
            window.location.replace("elections.html")
        })
    },

    requestEncrypt: async () => {
        var key
        console.log('hi')
        await ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [App.address],
        }).then((result) => {
            key = result
            console.log(key)

        }).catch((error) => {
            solidity.customMsg(false, "Request Encryption Key Failed")
            return null
            // if (error.code === 4001) {
            //     // EIP-1193 userRejectedRequest error
            //     console.log("We can't encrypt anything without the key.");
            //     return null
            // } else {
            //     console.error(error);
            // }
        })
        var data = "Candidate " + App.voted
        var encrypted = ethers.utils.hexlify(Buffer.from(
            JSON.stringify(
                encrypt({
                    publicKey: key,
                    data: data,
                    version: 'x25519-xsalsa20-poly1305'
                }),
            )
        ))
        console.log(encrypted)
        return encrypted
        // var plain
        // $(".decrypt").on("click", async function () {
        //     console.log("hi")
        //     plain = await ethereum.request({
        //         method: 'eth_decrypt',
        //         params: [encrypted, App.address],
        //     })
        //     console.log(plain)
        // })
    },

    setVoteGet: async () => {
        var voteGet = []
        for (var x = 0; x < App.totalCandidate; x++) {
            await App.contract.electionCandidate(App.electionID, x).then((val) => {
                var vote = BigInt(val.voteGet)
                if (x == App.voted) {
                    voteGet.push(solidity.encryptAdd(solidity.encrypt(1), vote))
                } else {
                    voteGet.push(solidity.encryptAdd(solidity.encrypt(0), vote))

                }
            })
        }
        console.log(voteGet)
        return voteGet
        // for (var x = 0; x < App.totalCandidate; x++) {
        //     console.log(solidity.decrypt(voteGet[x]))
        // }
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
