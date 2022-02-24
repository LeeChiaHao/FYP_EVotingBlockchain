/**
 * GLOBAL FUNCTION THAT WILL BE USED IN MULTIPLE JS FILE
*/
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Modal } from 'bootstrap';
import { ethers } from 'ethers';
import { arrayify, solidityKeccak256 } from 'ethers/lib/utils';
import * as paillierBigint from 'paillier-bigint';
const publicKey = new paillierBigint.PublicKey(BigInt(process.env.publicN), BigInt(process.env.publicG))
const privateKey = new paillierBigint.PrivateKey(BigInt(process.env.privateLambda), BigInt(process.env.privateMu), publicKey)
var signature

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
    signature = await signer.signMessage(signing)
    console.log("Signature: " + signature)
    window.localStorage.setItem("Signature", signature)
    verify = ethers.utils.verifyMessage(msg, signature)
    console.log("Verify: " + verify)
}

export async function getSignature(address) {
    var sign
    await getVotersContract().then(async function (contract) {
        await contract.voters(address).then(function (voter) {
            sign = voter.signature
        })
    })

    return sign
}

export async function headerCSS(page) {
    $(page).addClass("menuSelect")
}

export function navigate(page, item, remove) {
    if (localStorage.getItem(item) == null) {
        window.location.replace(page)
    }
    if (remove) {
        localStorage.removeItem(item)
    }
}
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

export async function getVoterAddress() {
    var contract = await getVotersContract()
    var address = contract.provider.getSigner().getAddress()
    return address
}

export async function getElectionAddress() {
    var contract = await getElectionsContract()
    var address = contract.provider.getSigner().getAddress()
    return address
}

export function bigNumberToNumber(bn) {
    return ethers.BigNumber.from(bn).toNumber()
}
// TODO: convert all to global function
export function txnModal() {
    return new Modal($("#txnModal"))
}

export function reqModal() {
    return new Modal($("#requestModal"))
}

export function txnLoad(txt) {
    $("#imgFail").addClass('d-none')
    $("#imgSuccess").addClass('d-none')
    $("#modalLoad").removeClass('d-none')
    $("#modalClose").addClass('d-none')
    $("#modalStatus").text(txt)
}

export function txnSuccess() {
    $("#modalStatus").text("Transaction Success")
    $("#modalClose").removeClass('d-none')
    $("#modalLoad").addClass('d-none')
    $("#imgSuccess").removeClass('d-none')
}

export function txnFail() {
    $("#modalStatus").text("Transaction Fail")
    $("#modalClose").removeClass('d-none')
    $("#modalLoad").addClass('d-none')
    $("#imgFail").removeClass('d-none')
}

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

export function encrypt(num) {
    // (asynchronous) creation of a random private, public key pair for the Paillier cryptosystem
    // console.log(homomorphicEncrypt)
    // console.log(BigInt("1234n"))
    // const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(1024)

    return publicKey.encrypt(num)
    // let num2 = publicKey.encrypt(2)
    // let total = publicKey.addition(num1, num2)

    // console.log(total)
    // console.log("2: " + publicKey.encrypt(3))
    // console.log("Decrypt: " + privateKey.decrypt(total))


    // 980679120639244011551600707605314936178007353564515431901220181794877126702237252235932362557004784611988349444012917072356472759499800645734664174176274710247607264755442925790862430302678238844266534853462988251991303431760574796539541720687024080313896778086426076851347880001010709344090680459552518654604734590400372874593964274300968423434720054188356971345714874253032973227925274365853973721511149953124818884469148401465791792438513133145344939279040734275109693392675078106861316214625047158953762794449880948537004556033363657612028890403634910291827367642964156376185066168347249872207480802802582724260n
}

export function encryptAdd(num1, num2) {
    return publicKey.addition(num1, num2)
}

export function decrypt(num) {
    return privateKey.decrypt(num)
}

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

window.addEventListener("load", function () {
    $(".contact").on("click", function () {
        var email = "1181100681@student.mmu.edu.my"
        var subject = "Regarding E-Voting Based Blockchain";
        var emailBody = ' ';
        document.location = "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;
    })
})