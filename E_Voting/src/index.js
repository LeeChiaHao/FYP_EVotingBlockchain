import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import { getVotersContract, txnSuccess, txnLoad, setSignature, getSignature, txnModal, reqModal, getVoterAddress } from './global';
import { Modal } from 'bootstrap';

const App = {
    contract: null,
    address: null,
    loadModal: null,
    requestModal: null,
    load: async () => {
        App.contract = await getVotersContract()
        App.address = await getVoterAddress()
        App.loadModal = txnModal()
        App.requestModal = reqModal()
        if (App.address == await App.contract.admin()) {
            window.location.replace("create.html")
        }

        await App.requestModal.show()
        await App.validateUser()
    },

    validateUser: async () => {
        $(".modalBtn").on("click", async function () {
            await setSignature(App.contract.provider.getSigner()).then(async function () {
                if (!await App.contract.isRegister(App.address)) {
                    window.location.assign("register.html")
                } else {
                    App.requestModal.hide()
                    App.loadModal.show()
                }

            })
            txnLoad("Validating Identity")
            console.log(setTimeout(function () {
                App.loadModal.hide()
                $(".logIn").addClass("d-none")
                $("#header").removeClass("d-none")
            }, 2000))
        })
    }
};

window.App = App;
window.addEventListener("load", async function () {
    $('body').removeClass('invisible')

    App.load()
})