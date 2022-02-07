/**
 * GLOBAL FUNCTION THAT WILL BE USED IN MULTIPLE JS FILE
*/
import { Modal } from 'bootstrap';
import { ethers } from 'ethers';
import * as paillierBigint from 'paillier-bigint';
const publicKey = new paillierBigint.PublicKey(BigInt(process.env.publicN), BigInt(process.env.publicG))
const privateKey = new paillierBigint.PrivateKey(BigInt(process.env.privateLambda), BigInt(process.env.privateMu), publicKey)
var signature

export async function setSignature(signer) {
    console.log(signer)
    var msg, verify
    msg = "Hi, Please proof your identity by signing this message. It would not cost any. TQ "
    signature = await signer.signMessage(msg)
    console.log(signature)
    localStorage.setItem("Signature", signature)
    verify = ethers.utils.verifyMessage(msg, signature)
    console.log(verify)
}

export function getSignature() {
    return signature
}

export async function getVotersContract() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);
        ethereum.on("accountsChanged", function (a) {
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
    if (await contract.isRegister(user)) {
        return true
    } else {
        return false
    }
}

export async function getElectionsContract() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);
        ethereum.on("accountsChanged", function (a) {
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

export async function getUserAddress() {
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
export function popUpModal() {
    return new Modal($("#txnModal"))
}

export function txnLoad() {
    $("#imgFail").addClass('d-none')
    $("#imgSuccess").addClass('d-none')
    $("#modalLoad").removeClass('d-none')
    $("#modalClose").addClass('d-none')
    $("#modalStatus").text('Making Transaction')
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

    console.log("Decrypt: " + privateKey.decrypt(9159019626706526750665984368015380950395505792821496854887782922934827908316518611421716036774044176268854444640043112320398989903405617022617134916318585314810068676325402174492245052922676101760923655264369490583352045139666179615520528509895117998717806176439679671460690620175154524455442455451952412751983429809111414773931047821574518972746046182917117996270685557193196442090680319989549164293199978899568716927218932001768115602598867806763388484920359259307170543753140412853776607651517738371761816256708374468745751639182031046805936240324240349901985239919958476166076495566587266478218251417871973164604n))

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