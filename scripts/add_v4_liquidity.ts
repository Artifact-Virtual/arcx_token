import { ethers } from "hardhat";

async function main() {
  console.log("💰 ARCx/WETH V4 Liquidity Addition");
  
  // Contract addresses  
  const POSITION_MANAGER = "0x7c5f5a4bfd8fd63184577525326123b519429bdc";
  const ARCX_TOKEN = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
  const WETH_BASE = "0x4200000000000000000000000000000000000006";
  const TREASURY_SAFE = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38";
  
  const [signer] = await ethers.getSigners();
  console.log("Signer:", await signer.getAddress());
  
  // Pool configuration
  const poolKey = {
    currency0: "0x4200000000000000000000000000000000000006", // WETH (lower address)
    currency1: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44", // ARCx
    fee: 3000,
    tickSpacing: 60, 
    hooks: "0x0000000000000000000000000000000000000000",
  };
  
  // Liquidity amounts - 25K ARCx + 12.5 ETH
  const liquidityAmounts = {
    weth: ethers.parseEther("12.5"), // 12.5 WETH
    arcx: ethers.parseEther("25000"), // 25K ARCx
  };
  
  console.log("\n💧 Liquidity Parameters:");
  console.log("WETH Amount:", ethers.formatEther(liquidityAmounts.weth));
  console.log("ARCx Amount:", ethers.formatEther(liquidityAmounts.arcx));
  
  // Tick range for full range liquidity (like V2)
  const MIN_TICK = -887272; // Minimum tick for full range
  const MAX_TICK = 887272;  // Maximum tick for full range
  
  console.log("Tick Range: Full Range Liquidity");
  console.log("Lower Tick:", MIN_TICK);
  console.log("Upper Tick:", MAX_TICK);
  
  // Get token contracts for approvals
  const arcxToken = await ethers.getContractAt("ARCxToken", ARCX_TOKEN);
  const wethToken = await ethers.getContractAt("IWETH", WETH_BASE);
  
  console.log("\n📋 REQUIRED SAFE TRANSACTIONS:");
  
  // Transaction 1: Approve WETH to Position Manager
  const wethApprovalData = wethToken.interface.encodeFunctionData("approve", [
    POSITION_MANAGER,
    liquidityAmounts.weth
  ]);
  
  console.log("\n1. APPROVE WETH:");
  console.log("To:", WETH_BASE);
  console.log("Value: 0");
  console.log("Data:", wethApprovalData);
  
  // Transaction 2: Approve ARCx to Position Manager  
  const arcxApprovalData = arcxToken.interface.encodeFunctionData("approve", [
    POSITION_MANAGER,
    liquidityAmounts.arcx
  ]);
  
  console.log("\n2. APPROVE ARCx:");
  console.log("To:", ARCX_TOKEN);
  console.log("Value: 0");
  console.log("Data:", arcxApprovalData);
  
  // Transaction 3: Add Liquidity Position
  // This is more complex - for now just show the structure
  console.log("\n3. ADD LIQUIDITY POSITION:");
  console.log("To:", POSITION_MANAGER);
  console.log("Value: 0");
  console.log("Note: Complex multicall transaction - requires V4 SDK integration");
  
  console.log("\n🚀 EXECUTION ORDER:");
  console.log("1. Transfer liquidity tokens to Treasury Safe");
  console.log("2. Execute WETH approval transaction");
  console.log("3. Execute ARCx approval transaction");
  console.log("4. Execute liquidity addition transaction");
  
  // Calculate required token transfers to treasury
  console.log("\n💸 REQUIRED TREASURY FUNDING:");
  console.log("Transfer to", TREASURY_SAFE + ":");
  console.log("- WETH:", ethers.formatEther(liquidityAmounts.weth));
  console.log("- ARCx:", ethers.formatEther(liquidityAmounts.arcx));
  
  return {
    positionManager: POSITION_MANAGER,
    poolKey,
    liquidityAmounts,
    tickRange: { lower: MIN_TICK, upper: MAX_TICK },
    treasurySafe: TREASURY_SAFE,
    approvalTxData: {
      weth: wethApprovalData,
      arcx: arcxApprovalData
    }
  };
}

main()
  .then((result) => {
    console.log("\n✅ Liquidity Addition Plan Generated!");
    console.log("Execute the Safe transactions in order to add initial liquidity");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to generate liquidity plan:", error);
    process.exit(1);
  });
