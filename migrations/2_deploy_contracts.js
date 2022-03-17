const Voters = artifacts.require("Voters");
const Elections = artifacts.require("Elections");
module.exports = async function (deployer) {
    await deployer.deploy(Voters);
    await deployer.deploy(Elections, Voters.address);
};
