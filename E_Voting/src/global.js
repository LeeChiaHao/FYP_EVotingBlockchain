/**
 * GLOBAL FUNCTION THAT WILL BE USED IN MULTIPLE JS FILE
*/
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Modal } from 'bootstrap';
import { ethers } from 'ethers';
import { arrayify, solidityKeccak256 } from 'ethers/lib/utils';
import * as paillierBigint from 'paillier-bigint';
// homomorphic encryption setup
const publicKey = new paillierBigint.PublicKey(BigInt(process.env.publicN), BigInt(process.env.publicG))
const privateKey = new paillierBigint.PrivateKey(BigInt(process.env.privateLambda), BigInt(process.env.privateMu), publicKey)

// set signature function, then the signature will be stored in Voter contract
export async function setSignature(signer) {
    var msg, verify
    msg = "Hi, Please proof your identity by signing this message. It would not cost any. TQ "
    var shamsg = solidityKeccak256(
        ["string"],
        [msg])
    // var shamsg = sha256(msg)
    console.log(shamsg);
    let signing = arrayify(shamsg)
    console.log(signing);
    var signature = await signer.signMessage(signing)
    console.log("Signature: " + signature)
    window.localStorage.setItem("Signature", signature)
    verify = ethers.utils.verifyMessage(signing, signature)
    console.log("Verify: " + verify)
}

export function oriMsg() {
    var msg = "Hi, Please proof your identity by signing this message. It would not cost any. TQ "
    var shamsg = solidityKeccak256(
        ["string"],
        [msg])
    return shamsg
}

// get Signature from Voter contract
export async function getSignature(address) {
    var sign
    await getVotersContract().then(async function (contract) {
        await contract.voters(address).then(function (voter) {
            sign = voter.signature
        })
    })
    return sign
}

// add CSS to the seleceted page's menu
export async function headerCSS(page) {
    $(page).addClass("menuSelect")
}

/* 
    example - result of an election or verifying must be clicked to access
    cannot access by typing the address else will be navigate
*/
export function navigate(page, item, remove) {
    if (localStorage.getItem(item) == null) {
        window.location.replace(page)
    }
    if (remove) {
        localStorage.removeItem(item)
    }
}

// return Voter contract
export async function getVotersContract() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []).then(function (val) {
            console.log("Test: " + val);
        });
        ethereum.on("accountsChanged", function () {
            localStorage.clear()
            window.location.replace("/")
        })
        const networkId = provider.provider.networkVersion
        const signer = provider.getSigner()
        const abi = votersJSON.abi
        var network = votersJSON.networks[networkId]
        var contract = new ethers.Contract(network.address, abi, signer)
        return contract
    } catch (e) {
        console.log(e)
    }
}

// return Elections contract
export async function getElectionsContract() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);
        ethereum.on("accountsChanged", function () {
            localStorage.clear()
            window.location.replace("/")
        })
        const networkId = provider.provider.networkVersion
        const signer = provider.getSigner()
        const abi = electionsJSON.abi
        var network = electionsJSON.networks[networkId]
        var contract = new ethers.Contract(network.address, abi, signer)
        return contract
    } catch (e) {
        console.log(e)
    }
}

// return the current user address when using Voter contract
export async function getVoterAddress() {
    var contract = await getVotersContract()
    var address = contract.provider.getSigner().getAddress()
    return address
}

// return the current user address when using Elections contract
export async function getElectionAddress() {
    var contract = await getElectionsContract()
    var address = contract.provider.getSigner().getAddress()
    return address
}

// check if the current user address is registered, if not then cannot access some pages
export async function isAuth(user) {
    var contract = await getVotersContract()
    console.log(await contract.isRegister(user))
    await menuClick(user)
    if (await contract.isRegister(user)) {
        return true
    } else {
        return false
    }
}

// set the localStorage, so we know if this user has the right to access certain pages
// need to click the menu to access, typing address may have problem
export async function menuClick(address) {
    console.log("AddressL " + address);
    let sign = await getSignature(address)
    $(".logo").on("click", async function () {
        window.localStorage.setItem("Signature", sign)
        window.location.assign("/")
    })

    $(".menu").on("click", async function () {
        let label = $(this).attr("aria-label")
        window.onbeforeunload = function () {
            window.onunload = function () {
                localStorage.clear()
                window.localStorage.setItem("Signature" + label, sign)
            }
        }
        window.location.assign($(this).attr("data-bs-target"))
    })
}

// convert big number to number
export function bigNumberToNumber(bn) {
    return ethers.BigNumber.from(bn).toNumber()
}

// get txnModal to perform diff function
export function txnModal() {
    return new Modal($("#txnModal"))
}

// get reqModal to perform diff function
export function reqModal() {
    return new Modal($("#requestModal"))
}

// get voterModal to perform diff function
export function voterModal() {
    return new Modal($("#voterModal"))
}

// txnModal show loading icon with custom txt
export function txnLoad(txt) {
    $("#imgFail").addClass('d-none')
    $("#imgSuccess").addClass('d-none')
    $("#modalLoad").removeClass('d-none')
    $("#modalClose").addClass('d-none')
    $("#modalStatus").text(txt)
}

// txnModal show success icon
export function txnSuccess() {
    $("#modalStatus").text("Transaction Success")
    $("#modalClose").removeClass('d-none')
    $("#modalLoad").addClass('d-none')
    $("#imgSuccess").removeClass('d-none')
}

// txnModal show fail icon
export function txnFail() {
    $("#modalStatus").text("Transaction Fail")
    $("#modalClose").removeClass('d-none')
    $("#modalLoad").addClass('d-none')
    $("#imgFail").removeClass('d-none')
}

// txnModal show success/fail with custom msg
export function customMsg(boolean, msg) {
    $("#modalClose").removeClass('d-none')
    $("#modalLoad").addClass('d-none')

    if (boolean) {
        $("#imgSuccess").removeClass('d-none')
        $("#modalStatus").text(msg)
    } else {
        $("#imgFail").removeClass('d-none')
        $("#modalStatus").text(msg)
    }
}

// encrypt the vote with homomorphic publicKey
export function encrypt(num) {
    // (asynchronous) creation of a random private, public key pair for the Paillier cryptosystem
    // console.log(homomorphicEncrypt)
    // console.log(BigInt("1234n"))
    // const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(1024)

    return publicKey.encrypt(num)
}

// homomorphic addition - add two encrypted number
export function encryptAdd(num1, num2) {
    return publicKey.addition(num1, num2)
}

// decrypt the encrypted total to get the votes
export function decrypt(num) {
    return privateKey.decrypt(num)
}

// check election's status
export function electionStatus(num) {
    switch (num) {
        case 0:
            return "Initial"
        case 1:
            return "Ongoing"
        case 2:
            return "End"
        default:
            return "Abort"
    }
}

// right and left caret when onClick, when click one open, others will close
export function caretOnClick(choice) {
    var object, object2
    if (choice == 2) {
        object = [".noVote", ".voted"]
        object2 = [".noV", ".vote"]
    } else {
        object = [".initialE", ".ongoingE", ".endE"]
        object2 = [".initial", ".ongoing", ".end"]
    }

    $(".btn-collapse").on("click", function () {
        var target = "." + $(this).attr("aria-controls")
        for (var x in object) {
            console.log(object[x]);
            if (object[x] != target) {
                $(object[x]).removeClass("show")
                $(object2[x]).find(".caret").addClass("left")
                $(object2[x]).find(".caret").html("&#9666;")
            }
        }
        var caret = $(this).find(".caret")
        if (caret.hasClass("left")) {
            caret.removeClass("left")
            caret.html("&#9656;")
        } else {
            caret.addClass("left")
            caret.html("&#9666;")
        }
    })
}

// convert timestamp of blockchain to understandable time
export function utcToLocal(utc) {
    var date = new Date(utc * 1000)
    var result = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "  "
        + String(date.getHours()).padStart(2, 0) + ":" + String(date.getMinutes()).padStart(2, 0)
    if (date.getHours() >= 12) {
        result += " PM"
    } else {
        result += " AM"
    }
    return result
}

// calculate the winner and store the winner voter and its vote in App.winner (an object - dictionary)
export async function countWinner(candidates) {
    var max = 0
    for (var x = 0; x < candidates; x++) {
        await App.contract.electionCandidate(App.electionID, x).then((val) => {
            var vote = decrypt(BigInt(val.voteGet))
            App.totalVote += BigInt(vote)
            App.votes[x] = vote
            if (vote > max) {
                max = vote
            }
        })
    }

    for (const e in App.votes) {
        if (App.votes[e] == max) {
            App.winner[e] = max
        }
    }
    console.log(1 in App.winner);
}

// load the layout of the the election result, later will load data inside
export async function loadContent() {
    var othersClass = "col-lg-5 border-0 p-0 mb-5"
    var winnerClass
    var len = Object.keys(App.winner).length
    if (len > 1) {
        winnerClass = "col-lg-5 border-0 mb-4"
    } else {
        winnerClass = "col-lg-12 border-0 mb-4"
        $(".winnerCandidates").addClass("justify-content-center")
        $(".winnerCandidates").removeClass("justify-content-between")
    }
    if (len == App.totalCandidate) {
        $(".others").addClass("d-none")
    }
    for (var x = 0; x < App.totalCandidate; x++) {
        if (x in App.winner) {
            $("<div></div").addClass(winnerClass + " candidate" + x).appendTo(".winnerCandidates")
        } else {
            $("<div></div").addClass(othersClass + " candidate" + x).appendTo(".othersCandidates")
        }
        $(".candidate" + x).prop("id", x)
        $(".candidate" + x).load("result.html")
    }

    var elec = await App.contract.elections(App.electionID)
    $(".elecName").text("Election Name: " + elec.name)
    await loadContentData()
}

// load all the voters' vote to show to users
export async function loadContentData() {
    for (var x = 0; x < App.totalCandidate; x++) {
        await App.contract.electionCandidate(App.electionID, x).then((val) => {
            var candidate = ".candidate" + x
            console.log(candidate);
            if (x in App.winner) {
                $(candidate).find(".card").addClass("winnerCard")
            }
            $(candidate).find(".otherCandidate").text("Candidate " + (x + 1))
            $(candidate).find(".candidateName").text(val.name)
            $(candidate).find(".candidateAge").text(val.age)
            $(candidate).find(".candidateGender").prop("src", val.gender + ".png")

            $(candidate).find(".candidateParty").text(val.party)
            $(candidate).find(".candidateSlogan").text(val.slogan)
            var percent = (Number(App.votes[x]) / Number(App.totalVote)).toFixed(4)
            if (isNaN(percent)) {
                percent = 0
            }
            $(candidate).find(".votePercent").text(percent * 100 + "% of votes obtained")
            $(candidate).find(".voteNumber").text("Get " + App.votes[x] + " vote(s)")
        }
        )
    }
}

// calculating the result and return the results
export async function calculate() {
    $(".results").hide()
    App.txnModal.show()
    txnLoad("Calculating Result")
    setTimeout(function () {

        $('.modalTitle').text("Vote Result")
        var zeroV = ""
        console.log(Object.values(App.winner));
        if (Object.values(App.winner).pop() == 0) {
            zeroV = "<p class='reqAlert'>*No voters vote in this election. Thus all candidates are winner automatically</p>"
        }
        $(".modalBody").html(`<p> There are total of ` + App.totalCandidate +
            ` candidates in this election.</p> <p> 
        At the end, we have <span class="fs-3">` + Object.keys(App.winner).length
            + ` Winner(s)</span>  in this election.</p>` + zeroV)

        $(".modalBtn").text("View result")
        $(".modalBtn").on("click", () => {
            App.txnModal.hide()
            App.reqModal.hide()
            $(".results").show()
        })

        App.reqModal.show()
    }, 1000)
}

/**
 * first load all the voters address and load the layout
 * then load the data into the layout
 */
export async function loadView(id, able) {
    var voters = await getVotersContract();
    var totalV = await voters.voterCount()
    var table = $(".viewBody:last-child")
    var len = $(".viewBody tr").length
    var address = []
    if (totalV == 0) {
        table.append("<div class='fs-4 text-center'> No Register voter now. Please encourage the voters to register.")
    }
    for (var i = 0; i < totalV; i++) {
        await voters.voterAddress(i).then(async function (add) {
            address.push(add)
            var className = "tableRow" + len
            table.append('<tr class="' + className + '"></tr > ')
            $('.' + className).load("subVoter.html")
            len++
        })
    }
    console.log("Length: " + len);

    for (var x = 0; x < len; x++) {
        var isVote = false
        if (able) {
            isVote = await voters.isVoted(address[x], id)
        }
        var voter = await voters.voters(address[x])
        var className = ".tableRow" + x
        console.log(className);
        $(className).find(".num").text(x + 1)
        $(className).find(".address").text(voter.account)
        $(className).find(".name").text(voter.name)
        $(className).find(".mail").text(voter.email)
        $(className).find("input").attr("disabled", able)
        $(className).find("input").attr("name", "voter" + x)
        $(className).find("input").attr("id", "voter" + x)
        $(className).find("label").attr("for", "voter" + x)
        $(className).find("input").attr("checked", true)

        if (able) {
            if (!isVote) {
                $(className).find("input").attr("checked", false)
                if (!await voters.canVote(address[x], id)) {
                    $(className).find("label").text("(Not allow to vote)")
                }
            }
        }
    }
    onSearch()
}

// load the on keyup search function
export async function onSearch() {
    $("#search").on("keyup", function () {
        var input = $(this).val().toUpperCase()
        $('tr').each(function () {
            if (!$(this).hasClass("first")) {
                var target = ""
                $(this).children().each(function () {
                    target += $(this).text().toUpperCase()
                })
                if (target.indexOf(input) > -1) {
                    $(this).show()
                } else {
                    $(this).hide()
                }
            }
        })
    })
}

export async function getCanVote(add, id) {
    var contract = await getVotersContract()
    var canVote = await contract.canVote(add, id)
    return canVote
}

// contact us function on footer
window.addEventListener("load", function () {
    $(".contact").on("click", function () {
        var email = "1181100681@student.mmu.edu.my"
        var subject = "Regarding E-Voting Based Blockchain";
        var emailBody = ' ';
        document.location = "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;
    })
})