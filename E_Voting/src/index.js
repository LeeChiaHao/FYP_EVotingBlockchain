import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import { getVotersContract, txnLoad, setSignature, txnModal, reqModal, getVoterAddress, menuClick } from './global';

const App = {
    contract: null,
    address: null,
    loadModal: null,
    requestModal: null,
    isRegister: null,
    load: async () => {
        App.contract = await getVotersContract()
        App.address = await getVoterAddress()
        App.loadModal = txnModal()
        App.requestModal = reqModal()
        App.isRegister = await App.contract.isRegister(App.address)
        menuClick(App.address)
        if (App.address == await App.contract.admin()) {
            window.location.replace("create.html")
        }

        if (localStorage.getItem("Signature") != null) {
            console.log(App.isRegister);
            if (App.isRegister) {
                $(".logIn").addClass("d-none")
                $("#header").removeClass("d-none")
            } else {
                App.requestModal.show()
            }
        } else {
            App.requestModal.show()
        }
        await App.validateUser()
    },

    validateUser: async () => {
        $(".modalBtn").on("click", async function () {
            await setSignature(App.contract.provider.getSigner()).then(async function () {
                if (!App.isRegister) {
                    window.location.assign("register.html")
                } else {
                    App.requestModal.hide()
                }
            })
            App.validating()
        })
    },

    validating: async () => {
        App.loadModal.show()
        txnLoad("Validating Identity")
        console.log(setTimeout(function () {
            App.loadModal.hide()
            $(".logIn").addClass("d-none")
            $("#header").removeClass("d-none")
        }, 2000))
    }
};

window.App = App;
window.addEventListener("load", async function () {
    $('body').removeClass('invisible')

    App.load()
})

window.onbeforeunload = function () {
    window.onunload = function () {
        localStorage.removeItem("Signature")
    }
}