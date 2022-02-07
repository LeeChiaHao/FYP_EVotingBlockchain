import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import { getVotersContract, getUserAddress, txnFail, txnSuccess, txnLoad, setSignature, getSignature } from './global';
import { Modal } from 'bootstrap';

const App = {
    contract: null,
    address: null,
    txnModal: null,
    requestModal: null,
    form: null,
    load: async () => {
        App.contract = await getVotersContract()
        App.address = await getUserAddress()
        App.txnModal = new Modal($("#txnModal"))
        App.requestModal = new Modal($('#requestModal'))
        App.form = document.querySelector('.validation')
        console.log(App.address)
        console.log(await App.contract.isRegister(App.address))
        if (App.address == await App.contract.admin()) {
            window.location.replace("create.html")
        }
        if (await App.contract.isRegister(App.address)) {
            App.requestModal.show()

        }
        $(".modalBtn").on("click", async function () {
            await setSignature(App.contract.provider.getSigner())
            console.log(getSignature())
            window.location.assign("profile.html")

        })
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
                        $(".modalClose").on("click", async function () {
                            App.requestModal.show()
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