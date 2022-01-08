import { ethers } from 'ethers';

export async function getUserContrat() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);
        ethereum.on("accountsChanged", function (a) {
            window.location.replace("/")
        })
        const networkId = provider.provider.networkVersion
        const signer = provider.getSigner()

        const abi = userJSON.abi
        var network = userJSON.networks[networkId]
        var contract = new ethers.Contract(network.address, abi, signer)
        return contract
    } catch (e) {
        // window.location.reload()
        console.log(e)
    }
}

export async function isAuth(user) {
    var contract = await getUserContrat()
    console.log(await contract.isRegister(user))
    if (await contract.isRegister(user)) {
        return true
    } else {
        return false
    }
}

export async function getElectionContract() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);
        ethereum.on("accountsChanged", function (a) {
            window.location.replace("/")
        })
        const networkId = provider.provider.networkVersion
        const signer = provider.getSigner()
        const abi = electionJSON.abi
        var network = electionJSON.networks[networkId]
        var contract = new ethers.Contract(network.address, abi, signer)
        return contract
    } catch (e) {
        // window.location.reload()
        console.log(e)
    }
}

export async function getUserAddress() {
    var contract = await getUserContrat()
    var address = contract.provider.getSigner().getAddress()
    return address
}

export async function getElectionAddress() {
    var contract = await getElectionContract()
    var address = contract.provider.getSigner().getAddress()
    return address
}

export function bigNumberToNumber(bn) {
    return ethers.BigNumber.from(bn).toNumber()
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