const User = artifacts.require("User");
const Election = artifacts.require("Election");
module.exports = async function (deployer) {
    await deployer.deploy(User);
    await deployer.deploy(Election, User.address);
};
