require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    moonbase: {
      url: "https://rpc.api.moonbase.moonbeam.network", // Moonbase Alpha RPC URL
      chainId: 1287, // Chain ID for Moonbase Alpha
      accounts: [process.env.PRIVATE_KEY], // Replace with your private key
    },
  },
};
