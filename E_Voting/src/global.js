import { ethers } from 'ethers';

export async function getUserContrat() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);

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

export async function getElectionContract() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);

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
    console.log(contract)
    var address = contract.provider.getSigner().getAddress()
    return address
}

export async function getElectionAddress() {
    var contract = await getElectionContract()
    console.log(contract)
    var address = contract.provider.getSigner().getAddress()
    return address
}

export function bigNumberToNumber(bn) {
    return ethers.BigNumber.from(bn).toNumber()
}