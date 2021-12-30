import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider/dist/detect-provider';

export async function getUserContrat() {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    try {

        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        await provider.send("eth_requestAccounts", []);
        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        const networkId = await provider.provider.networkVersion
        const signer = provider.getSigner()
        const abi = userJSON.abi
        var network = await userJSON.networks[networkId]
        // console.log(network)
        const address = await network.address
        var contract = new ethers.Contract(address, abi, signer)
        return contract
    } catch (e) {
        // window.location.reload()
        console.log(e)
    }

}

export async function getAddress() {
    var contract = await getUserContrat()
    console.log(contract)
    var address = contract.provider.getSigner().getAddress()
    return address
}