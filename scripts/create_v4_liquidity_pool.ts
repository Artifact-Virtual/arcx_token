import { ethers } from "hardhat";

async function main() {
  console.log("🚀 ARCx Uniswap V4 Liquidity Pool Setup");
  
  // Base Network V4 Addresses (Latest deployment)
  const POOL_MANAGER = "0x498581ff718922c3f8e6a244956af099b2652b2b";
  const POSITION_MANAGER = "0x7c5f5a4bfd8fd63184577525326123b519429bdc";
  const UNIVERSAL_ROUTER = "0x6ff5693b99212da76ad316178a184ab56d299b43";
  
  // Token Contracts
  const ARCX_TOKEN = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
  const WETH_BASE = "0x4200000000000000000000000000000000000006";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());
  
  // Get token contracts
  const arcxToken = await ethers.getContractAt("ARCxToken", ARCX_TOKEN);
  const weth = await ethers.getContractAt("IWETH", WETH_BASE);
  
  console.log("\n📊 Token Setup:");
  console.log("ARCx Token:", ARCX_TOKEN);
  console.log("WETH Base:", WETH_BASE);
  
  // V4 Pool Configuration
  const poolConfig = {
    currency0: ARCX_TOKEN < WETH_BASE ? ARCX_TOKEN : WETH_BASE,
    currency1: ARCX_TOKEN < WETH_BASE ? WETH_BASE : ARCX_TOKEN,
    fee: 3000, // 0.3% fee tier
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000", // No hooks
  };
  
  console.log("\n🏊 Pool Configuration:");
  console.log("Token0:", poolConfig.currency0);
  console.log("Token1:", poolConfig.currency1);
  console.log("Fee Tier: 0.3%");
  console.log("Tick Spacing:", poolConfig.tickSpacing);
  
  // Liquidity Parameters
  const liquidityAmounts = {
    arcx: ethers.parseEther("25000"), // 25K ARCx tokens
    eth: ethers.parseEther("12.5"), // 12.5 ETH (1 ARCx = 0.0005 ETH)
  };
  
  console.log("\n💰 Initial Liquidity:");
  console.log("ARCx Amount:", ethers.formatEther(liquidityAmounts.arcx));
  console.log("ETH Amount:", ethers.formatEther(liquidityAmounts.eth));
  console.log("Initial Price: 1 ARCx = 0.0005 ETH");
  
  // Price calculation for V4
  // sqrtPriceX96 = sqrt(price) * 2^96
  // For 1 ARCx = 0.0005 ETH, price = 0.0005
  // sqrt(0.0005) ≈ 0.0223606797749979
  const sqrtPriceX96 = "1771845812700903892492542091776"; // sqrt(0.0005) * 2^96
  
  console.log("\n🎯 Pool Initialization:");
  console.log("sqrt(P) * 2^96:", sqrtPriceX96);
  
  // Generate the deployment data for Safe execution
  console.log("\n📋 DEPLOYMENT STEPS:");
  console.log("1. Transfer liquidity tokens to treasury safe");
  console.log("2. Execute pool initialization transaction");
  console.log("3. Add initial liquidity position");
  console.log("4. Verify pool is live and trading");
  
  // Return deployment information
  return {
    poolManager: POOL_MANAGER,
    positionManager: POSITION_MANAGER,
    universalRouter: UNIVERSAL_ROUTER,
    poolConfig,
    liquidityAmounts,
    sqrtPriceX96,
    treasurySafe: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
  };
}

main()
  .then((deploymentInfo) => {
    console.log("\n✅ V4 LP Setup Configuration Ready!");
    console.log("\n🚀 Next Steps:");
    console.log("1. Fund treasury with liquidity tokens");
    console.log("2. Initialize pool via Safe");
    console.log("3. Add liquidity position");
    console.log("\nDeployment Info:", deploymentInfo);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
