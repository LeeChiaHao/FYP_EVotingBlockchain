import { getVotersContract, txnLoad, setSignature, txnModal, reqModal, getVoterAddress, menuClick, verifySignature } from './global';
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
        if (App.address == await App.contract.admin()) {
            window.location.replace("admin.html")
        }

        menuClick(App.address)
        var sign = localStorage.getItem("Signature")
        if (sign != null) {
            if (verifySignature(sign, App.address)) {
                if (App.isRegister) {
                    $(".logIn").addClass("d-none")
                    $("#header").removeClass("d-none")
                    $("main").show()
                } else {
                    App.requestModal.show()
                }
            } else {
                localStorage.clear()
                App.requestModal.show()
            }

        } else {
            localStorage.clear()
            App.requestModal.show()
        }
        await App.validateUser()
        await App.linkClick()
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
            await App.validating()
        })
    },

    // validate modal show
    validating: async () => {
        App.loadModal.show()
        txnLoad("Validating Identity")
        setTimeout(function () {
            App.loadModal.hide()
            $(".logIn").addClass("d-none")
            $("#header").removeClass("d-none")
            $("main").show()
        }, 2000)
    },

    linkClick: async () => {
        var vContract = await getVotersContract()
        var userName = await vContract.voters(App.address)
        $(".userName").text(userName.name)
        $('.link').on("click", function () {
            var sign = localStorage.getItem("Signature")
            var id = $(this).attr("id")
            window.onbeforeunload = function () {
                window.onunload = function () {
                    localStorage.clear()
                    window.localStorage.setItem("Signature" + id, sign)
                }
            }
        })
    }
};

window.App = App;
window.addEventListener("load", async function () {
    $('body').removeClass('invisible')
    $("main").hide()
    App.load()
})

window.onbeforeunload = function () {
    window.onunload = function () {
        var sign = localStorage.getItem("Signature")
        localStorage.clear()
        window.localStorage.setItem("register", sign)
    }
}