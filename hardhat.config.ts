import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const { ALCHEMY_API_KEY, ROPSTEN_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    hardhat: {
      // Local development network
    },
    ...(ALCHEMY_API_KEY && ROPSTEN_PRIVATE_KEY && ROPSTEN_PRIVATE_KEY.length === 64 ? {
      ropsten: {
        url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
      }
    } : {})
  }
};

export default config;