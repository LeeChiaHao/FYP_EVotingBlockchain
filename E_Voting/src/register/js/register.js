import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../style.css'
import '../css/register.css'

const App = {
    contract: null,
    address: null,
    txnModal: null,
    requestModal: null,
    form: null,

    checkAuth: async () => {
        return localStorage.getItem("Signature") == null
    },
    load: async () => {
        App.address = await solidity.getVoterAddress()
        App.contract = await solidity.getVotersContract()
        App.txnModal = solidity.txnModal()
        App.form = document.querySelector('.validation')
        console.log(App.address)
    },

    register: async () => {
        App.form.checkValidity()
        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0) {
            try {
                App.txnModal.show()
                solidity.txnLoad("Making Transaction")
                console.log($("#userName").val() + $("#email").val())
                await App.contract.createVoter($("#userName").val(), $("#email").val()
                    , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be", localStorage.getItem("Signature"), localStorage.getItem("Signature")).then(
                        (tx) => tx.wait().then(function () {
                            solidity.txnSuccess()
                            $(".modalClose").on("click", async function () {
                                localStorage.clear()
                                window.location.replace("/")
                            })
                        })
                    )
            } catch (e) {
                solidity.txnFail()
                console.log(e)
            }
        }
    }
};

window.App = App;
window.addEventListener("load", async function () {
    App.checkAuth().then(function (result) {
        if (result) {
            window.location.replace("/")
        } else {
            App.load()
            $('body').removeClass('invisible')
        }
    })
})