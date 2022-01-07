const User = artifacts.require("User");
const Election = artifacts.require("Election");


module.exports = function (deployer) {
    deployer.deploy(User);
    deployer.deploy(Election);
};
