import { getVotersContract, txnLoad, setSignature, txnModal, reqModal, getVoterAddress, menuClick } from './global';
import './style.css'

const App = {
    contract: null,
    address: null,
    loadModal: null,
    requestModal: null,
    isRegister: null,
    /**
     * load all content of key object
     * check if the localStorage have signature, means this user signed in already, if already register,
     * can access system directly; if not register, direct to register page
     */
    load: async () => {
        App.contract = await getVotersContract()
        App.address = await getVoterAddress()
        App.loadModal = txnModal()
        App.requestModal = reqModal()
        App.isRegister = await App.contract.isRegister(App.address)
        menuClick(App.address)
        if (App.address == await App.contract.admin()) {
            window.location.replace("list.html")
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

    // if first time log in, need sign first and if registered, can access system directly
    // else will go to register page
    validateUser: async () => {
        $(".modalBtn").on("click", async function () {
            await setSignature(App.contract.provider.getSigner()).then(async function () {
                if (!App.isRegister) {
                    window.location.replace("register.html")
                } else {
                    App.requestModal.hide()
                }
            })
            App.validating()
        })
    },

    // validate modal show
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