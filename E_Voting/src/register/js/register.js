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
        App.address = await globalFunc.getVoterAddress()
        App.contract = await globalFunc.getVotersContract()
        App.txnModal = globalFunc.txnModal()
        App.form = document.querySelector('.validation')
        console.log(App.address)
        if (await App.contract.isRegister(App.address)) {
            window.location.replace("/")
        }
        await App.keyUp()
    },

    keyUp: async () => {
        $("#userName").on("keyup", function () {
            App.form.classList.remove('was-validated')
        })
        $("#email").on("keyup", function () {
            App.form.classList.remove('was-validated')
            $("#email").parent().find(".valid-feedback, .invalid-feedback").hide()

        })
    },

    register: async () => {
        App.form.checkValidity()
        var emailValid = true

        if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#email").val())) {
            console.log("Wrong Email Cibai");
            emailValid = false

        }
        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0 && emailValid) {
            try {
                $("#email").parent().find(".valid-feedback").show()
                $("#email").parent().find(".invalid-feedback").hide()
                App.txnModal.show()
                globalFunc.txnLoad("Making Transaction")
                console.log($("#userName").val() + $("#email").val())
                await App.contract.createVoter($("#userName").val(), $("#email").val()
                    , "0x0f2f57d792336b3bd79ed7aa9d44ac9c3f4b11a05503c55a7c87a31b5357b2be", localStorage.getItem("Signature"), localStorage.getItem("Signature")).then(
                        (tx) => tx.wait().then(function () {
                            globalFunc.txnSuccess()
                            $(".modalClose").on("click", async function () {
                                // localStorage.clear()
                                window.location.replace("/")
                            })
                        })
                    )
            } catch (e) {
                globalFunc.txnFail()
                console.log(e)
            }
        } else {
            if (!emailValid) {
                $("#email").parent().find(".valid-feedback").hide()
                $("#email").parent().find(".invalid-feedback").show()
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