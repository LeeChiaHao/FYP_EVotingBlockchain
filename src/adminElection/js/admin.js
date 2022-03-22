import '../../style.css'
import '../css/admin.css'

const App = {
    contract: null,
    address: null,


    // only admin can access this page
    checkAuth: async () => {
        App.contract = await globalFunc.getElectionsContract()
        App.address = await globalFunc.getVoterAddress()
        if (App.address == await App.contract.admin()) {
            return true
        } else {
            return false
        }
    },
}

window.App = App;
window.addEventListener("load", async function () {
    App.checkAuth().then(function (result) {
        if (!result) {
            window.location.replace("/")
        } else {
            // App.load()
            $('body').removeClass('invisible')
        }
    })
})
