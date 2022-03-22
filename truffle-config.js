const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
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
      gas: 8000000,
      gasPrice: 24000000000,
      skipDryRun: true,
      timeoutBlocks: 200
    },
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8",    // Fetch exact version from solc-bin (default: truffle's version)

    }
  },
};
