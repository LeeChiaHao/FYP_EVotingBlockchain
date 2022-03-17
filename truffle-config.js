const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
// console.log(process.env.Infura_Key)
// console.log(process.env.MNENOMIC)
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    Ropsten: {
      provider: function () {
        return new HDWalletProvider(process.env.MNENOMIC, "wss://ropsten.infura.io/ws/v3/" + process.env.Infura_Key)
      },
      network_id: 3, // Ropsten Network ID
      networkCheckTimeout: 1000000,
      gas: 3000000,
      gasPrice: 10000000000
    }
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8",    // Fetch exact version from solc-bin (default: truffle's version)

    }
  },
};
