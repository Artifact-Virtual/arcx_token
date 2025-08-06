import { ethers } from "hardhat";

interface MintParams {
  poolKey: any;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  amount0Max: string;
  amount1Max: string;
  recipient: string;
  deadline: number;
}

async function main() {
  console.log("💎 ARCx Enterprise Liquidity Provision - Uniswap V4");
  console.log("==================================================");
  
  // Production Addresses
  const ARCX_TOKEN = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
  const WETH_BASE = "0x4200000000000000000000000000000000000006";
  const POSITION_MANAGER = "0x7c5f5a4bfd8fd63184577525326123b519429bdc";
  
  // Enterprise LP Parameters
  const ARCX_AMOUNT = ethers.parseEther("8"); // 8 ARCx (reduced proportionally)
  const ETH_AMOUNT = ethers.parseEther("0.0015");   // 0.0015 ETH (~$4 USD)
  
  // Pool Configuration
  const poolKey = {
    currency0: ARCX_TOKEN < WETH_BASE ? ARCX_TOKEN : WETH_BASE,
    currency1: ARCX_TOKEN < WETH_BASE ? WETH_BASE : ARCX_TOKEN,
    fee: 3000, // 0.3%
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000"
  };
  
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  
  console.log("🏛️  Treasury Address:", signerAddress);
  console.log("💰 ARCx Liquidity:", ethers.formatEther(ARCX_AMOUNT), "ARCx");
  console.log("💰 ETH Liquidity:", ethers.formatEther(ETH_AMOUNT), "ETH");
  console.log("📈 Target Ratio: 5333 ARCx : 1 ETH (~$4 USD total)");
  
  // Get Position Manager contract
  const positionManager = await ethers.getContractAt("IPositionManager", POSITION_MANAGER);
  
  // Calculate liquidity amount (simplified for full range)
  // For full range position: liquidity ≈ sqrt(amount0 * amount1)
  const liquidityAmount = ethers.parseEther("0.11"); // sqrt(8 * 0.0015) ≈ 0.11
  
  // Full range ticks for maximum coverage
  const tickLower = -887220;
  const tickUpper = 887220;
  
  // Prepare mint parameters
  const mintParams: MintParams = {
    poolKey: poolKey,
    tickLower: tickLower,
    tickUpper: tickUpper,
    liquidity: liquidityAmount.toString(),
    amount0Max: ARCX_TOKEN < WETH_BASE ? ARCX_AMOUNT.toString() : ETH_AMOUNT.toString(),
    amount1Max: ARCX_TOKEN < WETH_BASE ? ETH_AMOUNT.toString() : ARCX_AMOUNT.toString(),
    recipient: signerAddress,
    deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
  };
  
  console.log("\n🎯 LP Position Parameters:");
  console.log("- Liquidity Amount:", ethers.formatEther(liquidityAmount));
  console.log("- Tick Lower:", tickLower, "(Full Range)");
  console.log("- Tick Upper:", tickUpper, "(Full Range)");
  console.log("- Max Amount0:", ethers.formatEther(mintParams.amount0Max));
  console.log("- Max Amount1:", ethers.formatEther(mintParams.amount1Max));
  console.log("- Recipient:", mintParams.recipient);
  console.log("- Deadline:", new Date(mintParams.deadline * 1000).toISOString());
  
  // Pre-execution validation
  const arcxToken = await ethers.getContractAt("ARCxToken", ARCX_TOKEN);
  const weth = await ethers.getContractAt("IERC20", WETH_BASE);
  
  const arcxAllowance = await arcxToken.allowance(signerAddress, POSITION_MANAGER);
  const wethAllowance = await weth.allowance(signerAddress, POSITION_MANAGER);
  
  console.log("\n✅ Pre-execution Validation:");
  console.log("- ARCx Allowance:", ethers.formatEther(arcxAllowance), "ARCx");
  console.log("- WETH Allowance:", ethers.formatEther(wethAllowance), "WETH");
  
  if (arcxAllowance < ARCX_AMOUNT || wethAllowance < ETH_AMOUNT) {
    throw new Error("❌ Insufficient token approvals - run approve_lp_tokens.ts first");
  }
  
  console.log("\n🚀 Executing Enterprise LP Position...");
  
  try {
    // Execute the liquidity provision
    const mintTx = await positionManager.mint(mintParams, {
      gasLimit: 800000, // Generous gas limit for V4 complexity
      gasPrice: ethers.parseUnits("2", "gwei") // Base L2 optimized
    });
    
    console.log("📡 Transaction submitted:", mintTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await mintTx.wait();
    
    console.log("\n🏆 ENTERPRISE LP POSITION CREATED!");
    console.log("=================================");
    console.log("✅ Transaction Hash:", receipt.transactionHash);
    console.log("✅ Block Number:", receipt.blockNumber);
    console.log("✅ Gas Used:", receipt.gasUsed.toString());
    
    // Extract LP NFT token ID from events
    const lpTokenId = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id("Transfer(address,address,uint256)")
    )?.topics[3];
    
    if (lpTokenId) {
      console.log("✅ LP NFT Token ID:", parseInt(lpTokenId, 16));
    }
    
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      lpTokenId: lpTokenId ? parseInt(lpTokenId, 16) : null,
      poolKey,
      position: {
        liquidity: liquidityAmount,
        tickLower,
        tickUpper,
        amount0: ARCX_AMOUNT,
        amount1: ETH_AMOUNT
      }
    };
    
  } catch (error) {
    console.error("❌ LP Position creation failed:", error);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("\n🎉 ARCx Enterprise LP Deployment Complete!");
    console.log("==========================================");
    console.log("🏛️  Your ARCx/WETH V4 pool is now LIVE on Base L2");
    console.log("💎 Enterprise-grade liquidity provision successful");
    console.log("📊 Trading ready with 0.3% fee collection");
    console.log("🔒 LP NFT secured in treasury for governance");
    console.log("\n🚀 Next Steps:");
    console.log("1. Monitor trading volume on Base L2");
    console.log("2. Collect accumulated fees periodically");
    console.log("3. Consider concentrated positions as volume grows");
    console.log("4. Track LP performance metrics");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Enterprise LP deployment failed:", error);
    process.exit(1);
  });
