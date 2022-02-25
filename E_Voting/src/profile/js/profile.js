import '../../style.css'
import '../css/profile.css'

const App = {
    contract: null,
    address: null,
    loginID: null,
    txnModal: null,
    name: null,
    email: null,
    tmpName: null,
    tmpEmail: null,
    editArea: null,
    submitArea: null,
    form: null,

    // only registered voters can access
    checkAuth: async () => {
        App.address = await globalFunc.getVoterAddress()
        var isAuth = await globalFunc.isAuth(App.address)
        return isAuth
    },

    /**
     * loadd all content of key object
     * load the voters info to the page
     */
    load: async () => {
        globalFunc.headerCSS(".profile")
        App.contract = await globalFunc.getVotersContract()
        App.address = await globalFunc.getVoterAddress()
        App.name = $("#profileName")
        App.email = $("#profileEmail")
        App.editArea = $("#editArea")
        App.submitArea = $("#submitArea")
        App.form = document.querySelector('.validation')
        await globalFunc.navigate("/", "Signature3", false)

        var voter = await App.contract.voters(App.address)
        console.log("Capital letter: " + App.address);
        App.name.val(voter.name)
        App.email.val(voter.email)
        console.log(voter.signature);

        $("#profileAddress").val(voter.account)
        App.txnModal = globalFunc.txnModal()
    },

    // when user decide edit the profile
    // then the input will remove disabled and let user edit
    // address cannot be edit
    editProfile: async () => {
        App.name.prop("disabled", false)
        App.email.prop("disabled", false)
        App.tmpName = App.name.val()
        App.tmpEmail = App.email.val()
        App.name.on("keyup", function () {
            App.checkChange(App.tmpName, App.tmpEmail)
            App.form.classList.remove('was-validated')
        })
        App.email.on("keyup", function () {
            App.checkChange(App.tmpName, App.tmpEmail)
            App.form.classList.remove('was-validated')
            $("#profileEmail").parent().find(".valid-feedback, .invalid-feedback").hide()

        })
        App.editArea.hide()
        App.submitArea.addClass("d-flex")
    },

    // when submit, check valid of not empty and valid mail
    // else submit is not allow
    // if valid, then will call the editVoter function
    submitProfile: async () => {
        App.form.checkValidity()
        var emailValid = true
        if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#profileEmail").val())) {
            console.log("Wrong Email Cibai");
            emailValid = false
        }

        App.form.classList.add('was-validated')
        if ($(".was-validated:invalid").length == 0 && emailValid) {
            $("#profileEmail").parent().find(".valid-feedback").show()
            $("#profileEmail").parent().find(".invalid-feedback").hide()
            App.txnModal.show()
            try {
                App.contract.voters[App.address] = await App.contract.editVoter(App.name.val(), App.email.val()).then(
                    (tx) => tx.wait().then(function () {
                        globalFunc.customMsg(true, "Transaction Success. Profile updated successfully.")
                    })
                )
            } catch (e) {
                globalFunc.customMsg(false, "Transaction Fail. Profile update failed.")
                console.log(e)
            }
            $("#modalClose").on("click", function () {
                window.location.reload()
            })
        } else {
            if (!emailValid) {
                $("#profileEmail").parent().find(".valid-feedback").hide()
                $("#profileEmail").parent().find(".invalid-feedback").show()
            }
        }
    },

    // cancel edit, then the ori msg will load back and nothing chg
    cancelProfile: async () => {
        App.name.prop("disabled", true)
        App.email.prop("disabled", true)
        await App.name.val(App.tmpName)
        await App.email.val(App.tmpEmail)
        App.editArea.show()
        App.submitArea.removeClass("d-flex")
    },

    // check when the info has change, then the submit button will allow
    // else the submit button will always not allow
    checkChange: async (name, email) => {
        if (name == App.name.val() && email == App.email.val()) {
            $("#submitBtn").prop("disabled", true)
        } else {
            $("#submitBtn").prop("disabled", false)
        }
    }
}

window.App = App;
window.addEventListener("load", async function () {
    App.checkAuth().then(function (result) {
        if (!result) {
            window.location.replace("/")
        } else {
            App.load()
            $('body').removeClass('invisible')
        }
    })
})