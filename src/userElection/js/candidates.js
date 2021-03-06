import { ethers } from 'ethers'
import '../../style.css'
import '../css/candidate.css'
import { encrypt } from '@metamask/eth-sig-util'

const App = {
    contract: null,
    address: null,
    electionID: null,
    voted: null,
    totalCandidate: null,
    reqModal: null,
    isVoted: null,

    // only registered voters can access
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    /**
     * load all content of key object
     * check if this voter has voted in this election, if so, then not allowed to vote anymore
     * allow or not allow, the candidate info will be loaded
     */
    load: async () => {
        await globalFunc.headerCSS(".castVote")
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getElectionAddress()
        App.electionID = localStorage.getItem("election")
        globalFunc.navigate("elections.html", "election", true)
        App.reqModal = globalFunc.reqModal()
        App.totalCandidate = await App.contract.totalCandidate(App.electionID)

        await App.contract.encryptedVerify(App.electionID, await globalFunc.getSignature(App.address)).then(async (val) => {
            if (val == "") {
                App.isVoted = false;
                await App.onclickModal()
                $("#btn-confirm").on("click", async () => {
                    await App.submitVote()
                })
            } else {
                App.isVoted = true;
                $(".noVote").removeClass("d-none")
                $("#btn-confirm").prop("disabled", true)
            }
        })
        await App.loadCandidate(App.electionID, App.totalCandidate)
        await App.loadModal()
    },

    // notify the user some crucial info
    loadModal: async () => {
        $(".modalBtn").text("Okay, I understand.")
        App.reqModal.show()
        $('.modalTitle').text("Voting Information")
        $('.modalBody').html(`<h4>For your information: </h4>
        <p>After confirm the candidate you want to vote, the system will require you to share your encryption key.</p>
        <p class="reqAlert">Please do not share the encryption key with others to protect your vote information.</p>`)
        $(".modalBtn").on("click", async function () {
            App.reqModal.hide()
            $(".cand").show()
        })
    },

    // load all the candidates layout
    loadCandidate: async (id, total) => {
        var className = "col-lg-4 col-md-9 border-0 mt-lg-4 mt-5"
        for (var x = 0; x < total; x++) {
            $("<div></div").addClass(className + " candidate" + x).appendTo(".allCandidates")
            $(".candidate" + x).prop("id", x)
            $(".candidate" + x).load("candidate.html")
        }
        await App.loadCandidateData(id, total)
    },

    // load candidates data and onClick event into the layout
    loadCandidateData: async (id, total) => {
        var election = await App.contract.elections(id)
        $(".eName").text("Election: " + election.name)
        for (var x = 0; x <= total; x++) {
            await App.contract.electionCandidate(id, x).then((val) => {
                $(".candidate" + x).find(".candidateGender").prop("src", val.gender + ".png")
                $(".candidate" + x).find(".candidateID").text("Candidate " + (x + 1))
                $(".candidate" + x).find(".candidateName").text(val.name)
                $(".candidate" + x).find(".candidateAge").text(val.age)
                $(".candidate" + x).find(".candidateParty").text(val.party)
                $(".candidate" + x).find(".candidateSlogan").text(val.slogan)
            }
            )
        }
        if (!App.isVoted) {
            $(".candidateCard").on("click", function () {
                $(".candidateCard").removeClass("active")
                $(".btn-submit").prop("disabled", false)
                $(this).addClass("active")
                App.voted = $(this).parent().attr("id")
            })
        }
    },

    // submit the vote, and the confirm modal will show
    submitVote: async () => {
        if (App.voted != null) {
            App.requestModal()
        }
    },

    // confirm candidate selection
    requestModal: async () => {
        $(".sign").addClass("d-none")
        $(".option").removeClass("d-none")
        App.reqModal.show()
        $('.modalTitle').text("Voting Confirmation")
        $('.modalBody').html(`<p>Are you sure you want to vote to: </p> 
            <h4 class='text-center'> Candidate ` + (parseInt(App.voted) + 1) + "</h4>")
    },

    // if confirm, then will request encryption key from user by calling requestEncrypt function
    // then homomorphic add using the setVoteGet function
    // then can call the addVote and make transaction
    onclickModal: async () => {
        $("#modalYes").on("click", async function () {
            App.reqModal.hide()
            globalFunc.txnModal().show()
            globalFunc.txnLoad("Requesting Encryption Key")
            var signature = await globalFunc.getSignature(App.address)
            var encrypt
            if (globalFunc.verifySignature(signature, App.address)) {
                await App.requestEncrypt().then(async (re) => {
                    encrypt = re
                    if (encrypt != null) {
                        globalFunc.txnLoad("Making Transaction")
                        var voteGet = await App.setVoteGet()
                        try {
                            await App.contract.addVote(App.electionID, signature, encrypt, voteGet).then(
                                (tx) => tx.wait().then(() => {
                                    globalFunc.customMsg(true, "Your vote had been recorded.")
                                })
                            )
                        } catch (e) {
                            globalFunc.customMsg(false, "Transaction failed. Your vote is not recorded.")
                        }
                    } else {
                    }
                })
            } else {
                globalFunc.customMsg(false, "Something is wrong. Please contact the owner")
            }

        })

        $("#modalNo").on("click", async function () {
            App.reqModal.hide()
        })

        $("#modalClose").on("click", async function () {
            window.location.replace("elections.html")
        })
    },

    // request the encryption key from the user to encrypt the message (the choice of user)
    requestEncrypt: async () => {
        var key
        await ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [App.address],
        }).then((result) => {
            key = result
        }).catch((error) => {
            globalFunc.customMsg(false, "Request Encryption Key Failed")
        })
        var candidate = "Election " + App.electionID + ";Candidate " + (parseInt(App.voted) + 1)
        var e = encrypt({
            publicKey: key,
            data: candidate,
            version: 'x25519-xsalsa20-poly1305'
        })
        var encrypted = ethers.utils.hexlify(Buffer.from(
            JSON.stringify(e)
        ))
        return encrypted
    },

    // homomorphic add the voteGet 
    setVoteGet: async () => {
        var voteGet = []
        for (var x = 0; x < App.totalCandidate; x++) {
            await App.contract.electionCandidate(App.electionID, x).then((val) => {
                var vote = BigInt(val.voteGet)
                if (x == App.voted) {
                    voteGet.push(globalFunc.encryptAdd(globalFunc.encrypt(1), vote).toString())
                } else {
                    voteGet.push(globalFunc.encryptAdd(globalFunc.encrypt(0), vote).toString())
                }
            })
        }
        return voteGet
    }
}

window.App = App;
window.addEventListener("load", async function () {
    App.checkAuth().then(function (result) {
        if (!result) {
            window.location.replace("/")
        } else {
            $(".cand").hide()
            App.load()
            $('body').removeClass('invisible')
        }
    })
})



// 0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a2267716f4966626775685253386668395559324b3630594868486f6777416d4c4c222c22657068656d5075626c69634b6579223a2251734c6b6b2f6f622b366a4e637245752b766776584333534e3453445a6935377334363641467a695144493d222c2263697068657274657874223a225268446c566734493735576e4c503832774266594f2f5379566b65647048477230657463227d
// 0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a225469536e2f64464b4b354b582f2f52686a62687351675077783065396b353067222c22657068656d5075626c69634b6579223a2256683469725065795535677441752b6446566c4f535643796e644545645a712f514951705a67696b5778593d222c2263697068657274657874223a22486e73484b574374445352425a6a53514c4f422f6a67443236356e633045736a61414244227d
// 0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a223479754b42414750375a373045503466734a786e654b6d2b703772464f47586d222c22657068656d5075626c69634b6579223a227762764f37526c6e38436b6d6a466e77545936713231386c59387847552f2f7a2b397551357371673830673d222c2263697068657274657874223a22594c737a3855742f70596c357657666a4b2f734c36584371776f704a794c57446e6f2f69227d