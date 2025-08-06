import { ethers } from "hardhat";

async function generateSafeLPTransaction() {
  console.log("🔒 ARCx LP Safe Transaction Generator");
  console.log("====================================");
  
  // Production Addresses
  const ARCX_TOKEN = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
  const WETH_BASE = "0x4200000000000000000000000000000000000006";
  const POSITION_MANAGER = "0x7c5f5a4bfd8fd63184577525326123b519429bdc";
  const TREASURY_SAFE = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38";
  
  // LP Parameters (~$4 USD total)
  const ARCX_AMOUNT = ethers.parseEther("8"); // 8 ARCx
  const ETH_AMOUNT = ethers.parseEther("0.0015"); // 0.0015 ETH (~$4 USD)
  
  console.log("\n💰 LP Configuration:");
  console.log("- ARCx Amount:", ethers.formatEther(ARCX_AMOUNT), "ARCx");
  console.log("- ETH Amount:", ethers.formatEther(ETH_AMOUNT), "ETH");
  console.log("- Total Value: ~$4 USD");
  
  // Pool Configuration
  const poolKey = {
    currency0: ARCX_TOKEN < WETH_BASE ? ARCX_TOKEN : WETH_BASE,
    currency1: ARCX_TOKEN < WETH_BASE ? WETH_BASE : ARCX_TOKEN,
    fee: 3000, // 0.3%
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000"
  };
  
  // Full range ticks
  const tickLower = -887220;
  const tickUpper = 887220;
  const liquidityAmount = ethers.parseEther("0.11"); // sqrt(8 * 0.0015) ≈ 0.11
  
  // Mint parameters for Position Manager
  const mintParams = {
    poolKey: poolKey,
    tickLower: tickLower,
    tickUpper: tickUpper,
    liquidity: liquidityAmount.toString(),
    amount0Max: ARCX_TOKEN < WETH_BASE ? ARCX_AMOUNT.toString() : ETH_AMOUNT.toString(),
    amount1Max: ARCX_TOKEN < WETH_BASE ? ETH_AMOUNT.toString() : ARCX_AMOUNT.toString(),
    recipient: TREASURY_SAFE,
    deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
  };
  
  console.log("\n📋 SAFE TRANSACTION DETAILS:");
  console.log("===========================");
  
  // Step 1: ARCx Token Approval
  const arcxInterface = new ethers.Interface([
    "function approve(address spender, uint256 amount) external returns (bool)"
  ]);
  
  const approveCalldata = arcxInterface.encodeFunctionData("approve", [
    POSITION_MANAGER,
    ARCX_AMOUNT
  ]);
  
  console.log("\n🔓 TRANSACTION 1: ARCx Token Approval");
  console.log("To:", ARCX_TOKEN);
  console.log("Value: 0 ETH");
  console.log("Data:", approveCalldata);
  console.log("Operation: Call (0)");
  
  // Step 2: WETH Approval (assuming WETH wrap already done)
  const wethInterface = new ethers.Interface([
    "function approve(address spender, uint256 amount) external returns (bool)"
  ]);
  
  const wethApproveCalldata = wethInterface.encodeFunctionData("approve", [
    POSITION_MANAGER,
    ETH_AMOUNT
  ]);
  
  console.log("\n🔓 TRANSACTION 2: WETH Token Approval");
  console.log("To:", WETH_BASE);
  console.log("Value: 0 ETH");
  console.log("Data:", wethApproveCalldata);
  console.log("Operation: Call (0)");
  
  // Step 3: Position Manager Mint
  const positionInterface = new ethers.Interface([
    "function mint(tuple(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, int24 tickLower, int24 tickUpper, uint256 liquidity, uint256 amount0Max, uint256 amount1Max, address recipient, uint256 deadline) params) external payable returns (uint256 tokenId)"
  ]);
  
  const mintCalldata = positionInterface.encodeFunctionData("mint", [mintParams]);
  
  console.log("\n💎 TRANSACTION 3: LP Position Creation");
  console.log("To:", POSITION_MANAGER);
  console.log("Value: 0 ETH");
  console.log("Data:", mintCalldata);
  console.log("Operation: Call (0)");
  
  console.log("\n🏦 SAFE BATCH TRANSACTION JSON:");
  console.log("===============================");
  
  const safeBatch = {
    version: "1.0",
    chainId: "8453",
    createdAt: Date.now(),
    meta: {
      name: "ARCx LP Position Creation",
      description: "Create Uniswap V4 LP position with 8 ARCx + 0.0015 ETH (~$4 USD)",
      txBuilderVersion: "1.16.5"
    },
    transactions: [
      {
        to: ARCX_TOKEN,
        value: "0",
        data: approveCalldata,
        contractMethod: {
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
          ],
          name: "approve",
          payable: false
        },
        contractInputsValues: {
          spender: POSITION_MANAGER,
          amount: ARCX_AMOUNT.toString()
        }
      },
      {
        to: WETH_BASE,
        value: "0", 
        data: wethApproveCalldata,
        contractMethod: {
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
          ],
          name: "approve",
          payable: false
        },
        contractInputsValues: {
          spender: POSITION_MANAGER,
          amount: ETH_AMOUNT.toString()
        }
      },
      {
        to: POSITION_MANAGER,
        value: "0",
        data: mintCalldata,
        contractMethod: {
          inputs: [
            { name: "params", type: "tuple" }
          ],
          name: "mint",
          payable: true
        },
        contractInputsValues: {
          params: mintParams
        }
      }
    ]
  };
  
  console.log(JSON.stringify(safeBatch, null, 2));
  
  console.log("\n📊 TRANSACTION SUMMARY:");
  console.log("======================");
  console.log("✅ Total Transactions: 3");
  console.log("✅ ARCx Approval:", ethers.formatEther(ARCX_AMOUNT), "ARCx");
  console.log("✅ WETH Approval:", ethers.formatEther(ETH_AMOUNT), "ETH");
  console.log("✅ LP Position: Full Range (0.3% fee)");
  console.log("✅ Recipient: Treasury Safe");
  console.log("✅ Value: ~$4 USD total");
  
  console.log("\n🚀 READY FOR SAFE EXECUTION!");
  console.log("Copy the JSON above into Safe Transaction Builder");
  
  return safeBatch;
}

generateSafeLPTransaction()
  .then(() => {
    console.log("\n✅ Safe LP transaction data generated successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to generate Safe transaction:", error);
    process.exit(1);
  });
