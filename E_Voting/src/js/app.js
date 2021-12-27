App = {
    contracts: {},
    load: async () => {
        await App.register();
        await App.createUser();
    },

    register: async (e) => {
        console.log($("#userName").val());

        const user = $.getJSON('User.json');
        App.contracts.User = TruffleContract(user);
        App.contracts.User.setProvider(window.ethereum);
        console.log("jo");
        App.user = await App.contracts.User.deployed();
        // const voter = App.user.createVoter("Lee", "lee");
    },

    createUser: async () => {
        console.log("hi")
        console.log(await App.user.address)
    }
}


$(function () {
    $(window).load(function () {
        App.load();
    });
});