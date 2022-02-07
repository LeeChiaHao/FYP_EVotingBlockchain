import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import { getVotersContract, getUserAddress, txnFail, txnSuccess, txnLoad } from './global';
import { Modal } from 'bootstrap';

const App = {
    contract: null,
    address: null,
    txnModal: null,
    form: null,
    load: async () => {
        App.contract = await getVotersContract()
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