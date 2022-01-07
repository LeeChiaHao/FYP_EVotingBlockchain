import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import { getUserContrat, getUserAddress } from './global';


const App = {
    contract: null,
    address: null,
    load: async () => {
        // window.location.assign('create.html')

        App.contract = await getUserContrat()
        App.address = await getUserAddress()
        console.log(App.address)
        console.log(await App.contract.isRegister(App.address))
        if (await App.contract.isRegister(App.address)) {
            window.location.assign("create.html")
        }
    },
    register: async () => {
        try {
            console.log($("#userName").val() + $("#email").val())
            await App.contract.createVoter($("#userName").val(), $("#email").val(), { from: App.address }).then(
                (tx) => tx.wait().then(function () {
                    window.location.assign("profile.html")
                })
            )
            // console.log(await App.contract.voters(1))

        } catch (e) {
            console.log(e)
        }
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
