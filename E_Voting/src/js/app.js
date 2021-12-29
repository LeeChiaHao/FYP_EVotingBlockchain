import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css'
import $ from 'jQuery';
import { ethers } from 'ethers';
import UserArtifact from "../../build/contracts/User.json";

const App = {
    contract: null,
    account: null,
    load: async () => {
        // A Web3Provider wraps a standard Web3 provider, which is
        // what MetaMask injects as window.ethereum into each page
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        // Prompt user for account connections
        await provider.send("eth_requestAccounts", []);
        console.log(provider)
        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        const networkId = provider.provider.networkVersion
        App.account = provider.getSigner()
        const bytecode = UserArtifact.bytecode
        const abi = UserArtifact.abi

        // const factory = new ethers.ContractFactory(abi, bytecode, signer)
        // const contract = await factory.deploy();
        console.log(UserArtifact.networks[networkId].address)
        App.contract = new ethers.Contract(UserArtifact.networks[networkId].address, abi, App.account)
    },
    register: async () => {
        console.log($("#userName").val() + $("#email").val())
        await App.contract.createVoter($("#userName").val(), $("#email").val(), { from: App.account.getAddress() })
        console.log(await App.contract.voters(1))
        window.location.assign("profile.html")

    }
};

window.App = App;
window.addEventListener("load", async function () {
    App.load()
})






// import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import '../css/style.css'
// import $ from 'jQuery';

// import Web3 from "web3";
// import UserArtifact from "../../build/contracts/User.json";

// const App = {
//     web3: null,
//     account: null,
//     meta: null,

//     start: async function () {
//         const { web3 } = this;

//         try {
//             // get contract instance
//             const networkId = await web3.eth.net.getId();
//             const deployedNetwork = UserArtifact.networks[networkId];
//             this.meta = new web3.eth.Contract(
//                 UserArtifact.abi,
//                 deployedNetwork.address,
//             );
//             console.log(this.meta);
//             // get accounts
//             const accounts = await web3.eth.getAccounts();
//             this.account = accounts[0];
//             console.log(this.account)
//         } catch (error) {
//             console.error("Could not connect to contract or chain." + error);
//         }
//     },
//     register: async () => {

//     }
// };

// window.App = App;

// window.addEventListener("load", function () {
//     if (window.ethereum) {
//         // use MetaMask's provider
//         App.web3 = new Web3(window.ethereum);
//         window.ethereum.enable(); // get permission to access accounts
//     } else {
//         console.warn(
//             "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
//         );
//         // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
//         App.web3 = new Web3(
//             new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
//         );
//     }

//     App.start();
// });
