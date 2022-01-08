import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import { getUserContrat, getUserAddress, txnFail, txnSuccess, txnLoad } from './global';
import { Modal } from 'bootstrap';


const App = {
    contract: null,
    address: null,
    txnModal: null,
    form: null,
    load: async () => {
        App.contract = await getUserContrat()
        App.address = await getUserAddress()
        App.txnModal = new Modal($("#popUpModal"))
        App.form = document.querySelector('.validation')
        console.log(App.address)
        console.log(await App.contract.isRegister(App.address))
        if (App.address == await App.contract.admin()) {
            window.location.replace("create.html")
        }
        if (await App.contract.isRegister(App.address)) {
            window.location.assign("profile.html")
        }
        $('body').removeClass('invisible')
    },
    register: async () => {
        App.form.checkValidity()
        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0) {
            try {
                App.txnModal.show()
                txnLoad()
                console.log($("#userName").val() + $("#email").val())
                await App.contract.createVoter($("#userName").val(), $("#email").val()).then(
                    (tx) => tx.wait().then(function () {
                        txnSuccess()
                        $(".modalClose").on("click", function () {
                            window.location.assign("profile.html")
                        })
                    })
                )
            } catch (e) {
                txnFail()
                console.log(e)
            }
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
