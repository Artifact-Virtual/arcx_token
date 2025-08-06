import { ethers } from "hardhat";

async function main() {
  console.log("🔐 ARCx LP Token Approvals - Enterprise Grade");
  console.log("============================================");
  
  // Production Contract Addresses
  const ARCX_TOKEN = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
  const WETH_BASE = "0x4200000000000000000000000000000000000006";
  const POSITION_MANAGER = "0x7c5f5a4bfd8fd63184577525326123b519429bdc";
  
  // Precision LP Amounts
  const ARCX_AMOUNT = ethers.parseEther("8"); // 8 ARCx
  const ETH_AMOUNT = ethers.parseEther("0.0015");   // 0.0015 ETH (~$4 USD)
  
  // Get signer and contracts
  const [signer] = await ethers.getSigners();
  console.log("🏛️  Treasury Signer:", await signer.getAddress());
  
  const arcxToken = await ethers.getContractAt("ARCxToken", ARCX_TOKEN);
  const weth = await ethers.getContractAt("IERC20", WETH_BASE);
  
  // Check current balances
  const arcxBalance = await arcxToken.balanceOf(await signer.getAddress());
  const ethBalance = await ethers.provider.getBalance(await signer.getAddress());
  
  console.log("\n💰 Treasury Balance Check:");
  console.log("- ARCx Balance:", ethers.formatEther(arcxBalance), "ARCx");
  console.log("- ETH Balance:", ethers.formatEther(ethBalance), "ETH");
  
  // Validate sufficient balances
  if (arcxBalance < ARCX_AMOUNT) {
    throw new Error(`❌ Insufficient ARCx: Need ${ethers.formatEther(ARCX_AMOUNT)}, Have ${ethers.formatEther(arcxBalance)}`);
  }
  
  if (ethBalance < ETH_AMOUNT) {
    throw new Error(`❌ Insufficient ETH: Need ${ethers.formatEther(ETH_AMOUNT)}, Have ${ethers.formatEther(ethBalance)}`);
  }
  
  console.log("✅ Sufficient balances confirmed");
  
  // Check current allowances
  const arcxAllowance = await arcxToken.allowance(await signer.getAddress(), POSITION_MANAGER);
  const wethAllowance = await weth.allowance(await signer.getAddress(), POSITION_MANAGER);
  
  console.log("\n📋 Current Allowances:");
  console.log("- ARCx to Position Manager:", ethers.formatEther(arcxAllowance), "ARCx");
  console.log("- WETH to Position Manager:", ethers.formatEther(wethAllowance), "WETH");
  
  // Execute ARCx approval if needed
  if (arcxAllowance < ARCX_AMOUNT) {
    console.log("\n🔓 Approving ARCx tokens...");
    const arcxApproveTx = await arcxToken.approve(POSITION_MANAGER, ARCX_AMOUNT, {
      gasLimit: 100000
    });
    await arcxApproveTx.wait();
    console.log("✅ ARCx approval confirmed:", arcxApproveTx.hash);
  } else {
    console.log("✅ ARCx already approved");
  }
  
  // Wrap ETH to WETH if needed
  console.log("\n🔄 Wrapping ETH to WETH...");
  const wrapTx = await signer.sendTransaction({
    to: WETH_BASE,
    value: ETH_AMOUNT,
    data: "0xd0e30db0", // deposit() function signature
    gasLimit: 50000
  });
  await wrapTx.wait();
  console.log("✅ ETH wrapped to WETH:", wrapTx.hash);
  
  // Execute WETH approval
  console.log("\n🔓 Approving WETH tokens...");
  const wethApproveTx = await weth.approve(POSITION_MANAGER, ETH_AMOUNT, {
    gasLimit: 100000
  });
  await wethApproveTx.wait();
  console.log("✅ WETH approval confirmed:", wethApproveTx.hash);
  
  // Final verification
  const finalArcxAllowance = await arcxToken.allowance(await signer.getAddress(), POSITION_MANAGER);
  const finalWethAllowance = await weth.allowance(await signer.getAddress(), POSITION_MANAGER);
  
  console.log("\n🎯 Final Approval Status:");
  console.log("- ARCx Approved:", ethers.formatEther(finalArcxAllowance), "ARCx ✅");
  console.log("- WETH Approved:", ethers.formatEther(finalWethAllowance), "WETH ✅");
  
  return {
    arcxToken: ARCX_TOKEN,
    wethToken: WETH_BASE,
    positionManager: POSITION_MANAGER,
    approvedAmounts: {
      arcx: finalArcxAllowance,
      weth: finalWethAllowance
    }
  };
}

main()
  .then((result) => {
    console.log("\n🏆 Enterprise Token Approvals Complete!");
    console.log("=====================================");
    console.log("Ready for Uniswap V4 liquidity provision");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Approval process failed:", error);
    process.exit(1);
  });
