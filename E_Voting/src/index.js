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

        $(".modalBtn").on("click", async function () {
            await setSignature(App.contract.provider.getSigner()).then(function () {
                App.requestModal.hide()
            })
            console.log(getSignature())
            if (await App.contract.isRegister(App.address)) {
                window.location.assign("elections.html")
            }

        })
        $('body').removeClass('invisible')
        App.requestModal.show()
    },

    register: async () => {
        App.form.checkValidity()
        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0) {
            try {
                App.txnModal.show()
                txnLoad("Making Transaction")
                console.log($("#userName").val() + $("#email").val())
                await App.contract.createVoter($("#userName").val(), $("#email").val()
                    , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be", localStorage.getItem("Signature"), localStorage.getItem("Signature")).then(
                        (tx) => tx.wait().then(function () {
                            txnSuccess()
                            $(".modalClose").on("click", async function () {
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