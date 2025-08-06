import { ethers } from "hardhat";

interface PoolKey {
  currency0: string;
  currency1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
}

async function main() {
  console.log("🚀 Setting up ARCx/WETH Uniswap V4 Pool");
  
  // Base V4 Contract Addresses (Production Mainnet)
  const POOL_MANAGER = "0x498581ff718922c3f8e6a244956af099b2652b2b";
  const POSITION_MANAGER = "0x7c5f5a4bfd8fd63184577525326123b519429bdc";
  const UNIVERSAL_ROUTER = "0x6ff5693b99212da76ad316178a184ab56d299b43";
  
  // Token Addresses (Verified Production)
  const ARCX_TOKEN = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44"; // ARCx Genesis Token
  const WETH_BASE = "0x4200000000000000000000000000000000000006"; // Base WETH
  
  // Pool Parameters - Enterprise-Grade 0.3% Fee Tier
  const FEE = 3000; // 0.3% - Standard for established tokens
  const TICK_SPACING = 60; // Optimized for 0.3% fee tier
  const HOOKS_ADDRESS = "0x0000000000000000000000000000000000000000"; // Clean deployment, hooks optional
  
  // Precision Liquidity Parameters
  const INITIAL_ARCX_LIQUIDITY = ethers.parseEther("25000"); // 25K ARCx (Genesis Supply)
  const INITIAL_ETH_LIQUIDITY = ethers.parseEther("12.5");   // 12.5 ETH (2000:1 ratio)
  
  console.log("💎 Enterprise LP Parameters:");
  console.log("- ARCx Liquidity:", ethers.formatEther(INITIAL_ARCX_LIQUIDITY), "ARCx");
  console.log("- ETH Liquidity:", ethers.formatEther(INITIAL_ETH_LIQUIDITY), "ETH");
  console.log("- Initial Ratio: 2000 ARCx per ETH");
  console.log("- Fee Tier: 0.3% (Professional Standard)");
  console.log("- Network: Base L2 (Optimized Gas)");
  
  // Get contract instances with precision
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log("🔐 Treasury Signer:", signerAddress);
  
  // Verify signer has sufficient balance
  const balance = await ethers.provider.getBalance(signerAddress);
  console.log("💰 Signer ETH Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("15")) {
    throw new Error("❌ Insufficient ETH balance for LP deployment");
  }
  
  const poolManager = await ethers.getContractAt(
    "IPoolManager", 
    POOL_MANAGER
  );
  
  const positionManager = await ethers.getContractAt(
    "IPositionManager",
    POSITION_MANAGER
  );
  
  // Create Pool Key with precision ordering
  const poolKey: PoolKey = {
    currency0: ARCX_TOKEN < WETH_BASE ? ARCX_TOKEN : WETH_BASE,
    currency1: ARCX_TOKEN < WETH_BASE ? WETH_BASE : ARCX_TOKEN,
    fee: FEE,
    tickSpacing: TICK_SPACING,
    hooks: HOOKS_ADDRESS,
  };
  
  console.log("🎯 Pool Key Configuration:");
  console.log("- Currency0 (Lower):", poolKey.currency0);
  console.log("- Currency1 (Higher):", poolKey.currency1);
  console.log("- Fee:", poolKey.fee, "basis points");
  console.log("- Tick Spacing:", poolKey.tickSpacing);
  console.log("- Hooks:", poolKey.hooks === "0x0000000000000000000000000000000000000000" ? "None (Clean)" : poolKey.hooks);
  
  // Enterprise-grade pool deployment with precision
  try {
    // Generate Pool ID with cryptographic precision
    const poolId = ethers.keccak256(
      ethers.solidityPacked(
        ["address", "address", "uint24", "int24", "address"],
        [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
      )
    );
    
    console.log("🆔 Pool ID (SHA3):", poolId);
    
    // Calculate precise initial price (2000 ARCx per ETH)
    // sqrtPriceX96 = sqrt(price) * 2^96
    // For ARCx as currency0: price = 1/2000 = 0.0005
    const price = 1 / 2000; // 0.0005 ETH per ARCx
    const sqrtPrice = Math.sqrt(price);
    const sqrtPriceX96 = Math.floor(sqrtPrice * (2 ** 96)).toString();
    
    console.log("💰 Initial Price Calculation:");
    console.log("- Target Price:", price, "ETH per ARCx");
    console.log("- Sqrt Price:", sqrtPrice);
    console.log("- SqrtPriceX96:", sqrtPriceX96);
    
    console.log("\n🚀 Initializing Enterprise V4 Pool...");
    
    // Execute pool initialization with gas optimization
    const initTx = await poolManager.initialize(poolKey, sqrtPriceX96, {
      gasLimit: 500000, // Sufficient gas for V4 init
    });
    
    const receipt = await initTx.wait();
    
    console.log("✅ Pool Initialized with Enterprise Precision!");
    console.log("- Transaction Hash:", initTx.hash);
    console.log("- Block Number:", receipt.blockNumber);
    console.log("- Gas Used:", receipt.gasUsed.toString());
    
    // Enterprise LP Position Configuration
    console.log("\n📊 Enterprise Liquidity Position Setup:");
    console.log("- ARCx Amount:", ethers.formatEther(INITIAL_ARCX_LIQUIDITY), "ARCx");
    console.log("- WETH Amount:", ethers.formatEther(INITIAL_ETH_LIQUIDITY), "WETH");
    console.log("- Target Ratio: 2000 ARCx : 1 ETH");
    console.log("- Value Locked: ~$31,250 USD (at $2500/ETH)");
    
    // Full-range position for maximum trading coverage
    const tickLower = -887220; // Minimum tick (covers all prices)
    const tickUpper = 887220;  // Maximum tick (covers all prices)
    
    console.log("- Position Range: Full Range (Maximum Coverage)");
    console.log("- Tick Lower:", tickLower);
    console.log("- Tick Upper:", tickUpper);
    console.log("- Fee Collection: 0.3% per swap");
    
    return {
      poolManager: POOL_MANAGER,
      positionManager: POSITION_MANAGER,
      universalRouter: UNIVERSAL_ROUTER,
      poolKey,
      poolId,
      liquidityParams: {
        arcxAmount: INITIAL_ARCX_LIQUIDITY,
        ethAmount: INITIAL_ETH_LIQUIDITY,
        tickLower,
        tickUpper,
      },
      priceInfo: {
        sqrtPriceX96,
        targetPrice: price,
        initialRatio: "2000:1 (ARCx:ETH)"
      }
    };
    
  } catch (error) {
    console.error("Error setting up pool:", error);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("\n🎉 Enterprise Uniswap V4 Pool Setup Complete!");
    console.log("======================================");
    console.log("📋 Deployment Summary:");
    console.log("- Pool Manager:", result.poolManager);
    console.log("- Position Manager:", result.positionManager);
    console.log("- Universal Router:", result.universalRouter);
    console.log("- Pool ID:", result.poolId);
    console.log("- Initial Price:", result.priceInfo.initialRatio);
    console.log("- Liquidity Ready:", ethers.formatEther(result.liquidityParams.arcxAmount), "ARCx");
    console.log("- ETH Ready:", ethers.formatEther(result.liquidityParams.ethAmount), "ETH");
    console.log("\n🚀 Next Steps:");
    console.log("1. Approve tokens to Position Manager");
    console.log("2. Execute liquidity provision via Safe");
    console.log("3. Monitor trading activity on Base L2");
    console.log("4. Collect fees periodically");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Enterprise LP Setup Failed:", error);
    process.exit(1);
  });
