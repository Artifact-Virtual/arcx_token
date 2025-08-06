import { ethers } from "hardhat";

// Minimal V4 PoolManager ABI for pool operations
const POOL_MANAGER_ABI = [
  "function initialize((address,address,uint24,int24,address) key, uint160 sqrtPriceX96) external returns (int24 tick)",
  "function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)",
  "function getLiquidity(bytes32 poolId) external view returns (uint128)",
];

// Position Manager ABI for liquidity management  
const POSITION_MANAGER_ABI = [
  "function modifyLiquidities(bytes calldata unlockData, uint256 deadline) external payable",
  "function initialize((address,address,uint24,int24,address) key, uint160 sqrtPriceX96) external returns (int24 tick)",
];

async function main() {
  console.log("🚀 Initializing ARCx/WETH V4 Pool");
  
  // Contract addresses
  const POOL_MANAGER = "0x498581ff718922c3f8e6a244956af099b2652b2b";
  const POSITION_MANAGER = "0x7c5f5a4bfd8fd63184577525326123b519429bdc";
  
  // Tokens (sorted by address)
  const ARCX_TOKEN = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
  const WETH_BASE = "0x4200000000000000000000000000000000000006";
  
  const [signer] = await ethers.getSigners();
  console.log("Signer:", await signer.getAddress());
  
  // Create pool key
  const poolKey = {
    currency0: ARCX_TOKEN < WETH_BASE ? ARCX_TOKEN : WETH_BASE,
    currency1: ARCX_TOKEN < WETH_BASE ? WETH_BASE : ARCX_TOKEN,  
    fee: 3000,
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000",
  };
  
  console.log("Pool Key:", poolKey);
  
  // Get contracts
  const poolManager = new ethers.Contract(POOL_MANAGER, POOL_MANAGER_ABI, signer);
  
  // Calculate sqrt price for 1 ARCx = 0.0005 ETH
  const sqrtPriceX96 = "1771845812700903892492542091776";
  
  console.log("Initializing pool with sqrtPriceX96:", sqrtPriceX96);
  
  try {
    // Generate transaction data for Safe execution
    const initializeData = poolManager.interface.encodeFunctionData("initialize", [
      [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks],
      sqrtPriceX96
    ]);
    
    console.log("\n📋 SAFE TRANSACTION DATA:");
    console.log("To:", POOL_MANAGER);
    console.log("Value: 0");
    console.log("Data:", initializeData);
    
    // Also generate pool ID for reference
    const poolId = ethers.keccak256(
      ethers.solidityPacked(
        ["address", "address", "uint24", "int24", "address"],
        [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
      )
    );
    
    console.log("\n🆔 Pool ID:", poolId);
    
    return {
      poolManager: POOL_MANAGER,
      positionManager: POSITION_MANAGER,
      poolKey,
      poolId,
      sqrtPriceX96,
      initializeData,
      treasurySafe: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"
    };
    
  } catch (error) {
    console.error("Error generating pool data:", error);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("\n✅ Pool Initialization Data Generated!");
    console.log("Execute the Safe transaction to initialize the pool");
    console.log("\nNext: Run liquidity addition script after pool is initialized");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to generate pool data:", error);
    process.exit(1);
  });
