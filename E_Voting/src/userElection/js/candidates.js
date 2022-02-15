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
        App.reqModal = solidity.reqModal()
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)

        App.loadCandidate(App.electionID, App.totalCandidate)
        await App.loadModal()
        await App.contract.encryptedVerify(App.electionID, localStorage.getItem("Signature")).then(async (val) => {
            console.log(val)
            if (val == "") {
                await App.onclickModal()

                $("#btn-confirm").on("click", async () => {
                    await App.submitVote()
                })
            } else {
                $(".noVote").removeClass("d-none")
                $("#btn-confirm").prop("disabled", true)

            }
        })

    },

    loadModal: async () => {
        $(".modalBtn").text("Okay, I understand.")
        App.reqModal.show()
        $('.modalTitle').text("Voting Information")
        $('.modalBody').html(`<h4>For your information: </h4>
        <p>After confirm the candidate you want to vote, the system will require you to share your encryption key.</p>
        <p>Please do not share the encryption key with others to protect your vote information.</p>`)
        $(".modalBtn").on("click", async function () {
            App.reqModal.hide()
        })
    },

    loadCandidate: async (id, total) => {
        var className = "col-lg-4 col-md-9 border-0 mb-5"
        for (var x = 0; x < total; x++) {
            $("<div></div").addClass(className + " candidate" + x).appendTo(".allCandidates")
            $(".candidate" + x).prop("id", x)
            $(".candidate" + x).load("candidate.html")
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
        if (App.voted != null) {
            App.requestModal()
        }
    },

    requestModal: async () => {
        $(".sign").addClass("d-none")
        $(".option").removeClass("d-none")
        solidity.reqModal().show()
        $('.modalTitle').text("Voting Confirmation")
        $('.modalBody').html(`<p>Are you sure you want to vote to: </p> 
            <h4 class='text-center'> Candidate " + (parseInt(App.voted) + 1) + "</h4>`)
    },

    onclickModal: async () => {
        $("#modalYes").on("click", async function () {
            solidity.reqModal().hide()
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
            solidity.reqModal().hide()
        })

        $("#modalClose").on("click", async function () {
            window.location.replace("elections.html")
        })
    },

    requestEncrypt: async () => {
        var key
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
        var candidate = "Candidate " + (parseInt(App.voted) + 1)
        console.log(candidate + "Key: " + key)
        var e = encrypt({
            publicKey: key,
            data: candidate,
            version: 'x25519-xsalsa20-poly1305'
        })
        console.log(Buffer[1]);
        var encrypted = ethers.utils.hexlify(Buffer.from(
            JSON.stringify(e)
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
                    voteGet.push(solidity.encryptAdd(solidity.encrypt(1), vote).toString())
                } else {
                    voteGet.push(solidity.encryptAdd(solidity.encrypt(0), vote).toString())
                }
            })
        }
        console.log(typeof (voteGet[1]))
        return voteGet
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



// 0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a2267716f4966626775685253386668395559324b3630594868486f6777416d4c4c222c22657068656d5075626c69634b6579223a2251734c6b6b2f6f622b366a4e637245752b766776584333534e3453445a6935377334363641467a695144493d222c2263697068657274657874223a225268446c566734493735576e4c503832774266594f2f5379566b65647048477230657463227d
// 0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a225469536e2f64464b4b354b582f2f52686a62687351675077783065396b353067222c22657068656d5075626c69634b6579223a2256683469725065795535677441752b6446566c4f535643796e644545645a712f514951705a67696b5778593d222c2263697068657274657874223a22486e73484b574374445352425a6a53514c4f422f6a67443236356e633045736a61414244227d
// 0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a223479754b42414750375a373045503466734a786e654b6d2b703772464f47586d222c22657068656d5075626c69634b6579223a227762764f37526c6e38436b6d6a466e77545936713231386c59387847552f2f7a2b397551357371673830673d222c2263697068657274657874223a22594c737a3855742f70596c357657666a4b2f734c36584371776f704a794c57446e6f2f69227d