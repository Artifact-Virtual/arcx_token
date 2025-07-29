import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const { 
  ALCHEMY_API_KEY, 
  DEPLOYER_PRIVATE_KEY, 
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  BASESCAN_API_KEY,
  GAS_PRICE_MAINNET = "20",
  GAS_PRICE_TESTNET = "10",
  REPORT_GAS = "true"
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // Local development network
      accounts: {
        count: 20,
        accountsBalance: "100000000000000000000", // 100 ETH
      },
    },
    // Ethereum Mainnet
    ...(ALCHEMY_API_KEY && DEPLOYER_PRIVATE_KEY && DEPLOYER_PRIVATE_KEY.length === 64 ? {
      mainnet: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
        gasPrice: parseInt(GAS_PRICE_MAINNET) * 1000000000, // Convert gwei to wei
        timeout: 60000,
      }
    } : {}),
    // Ethereum Sepolia Testnet
    ...(ALCHEMY_API_KEY && DEPLOYER_PRIVATE_KEY && DEPLOYER_PRIVATE_KEY.length === 64 ? {
      sepolia: {
        url: `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
        gasPrice: parseInt(GAS_PRICE_TESTNET) * 1000000000,
        timeout: 60000,
      }
    } : {}),
    // Base L2
    ...(ALCHEMY_API_KEY && DEPLOYER_PRIVATE_KEY && DEPLOYER_PRIVATE_KEY.length === 64 ? {
      base: {
        url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
        gasPrice: parseInt(GAS_PRICE_MAINNET) * 1000000000,
        timeout: 60000,
      }
    } : {}),
    // Polygon
    ...(ALCHEMY_API_KEY && DEPLOYER_PRIVATE_KEY && DEPLOYER_PRIVATE_KEY.length === 64 ? {
      polygon: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
        gasPrice: parseInt(GAS_PRICE_MAINNET) * 1000000000,
        timeout: 60000,
      }
    } : {}),
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY || "",
      sepolia: ETHERSCAN_API_KEY || "",
      polygon: POLYGONSCAN_API_KEY || "",
      base: BASESCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
};

export default config;