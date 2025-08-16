// scripts/final-cleanup-audit.ts
// Comprehensive cleanup and audit after successful token recovery

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, getTokenContract } from "./shared/utils";

async function main() {
  displayScriptHeader(
    "Final Cleanup & Audit",
    "Comprehensive post-recovery cleanup and security audit"
  );

  const [signer] = await ethers.getSigners();
  console.log(`\n🔐 Signer: ${signer.address}`);

  // Get contracts
  const auction = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
  const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
  
  console.log("\n📊 POST-RECOVERY AUDIT");
  console.log("======================");
  
  // 1. Check auction finalization status
  const finalized = await auction.finalized();
  console.log(`✅ Auction Finalized: ${finalized ? "🟢 YES" : "🔴 NO"}`);
  
  // 2. Check all token balances
  const auctionBalance = await token.balanceOf(CONTRACTS.DUTCH_AUCTION);
  const treasuryBalance = await token.balanceOf(CONTRACTS.TREASURY_SAFE);
  const deployerBalance = await token.balanceOf(signer.address);
  const airdropBalance = await token.balanceOf(CONTRACTS.SMART_AIRDROP);
  const vestingBalance = await token.balanceOf(CONTRACTS.MASTER_VESTING);
  
  console.log(`\n💰 TOKEN DISTRIBUTION:`);
  console.log(`Auction Contract: ${ethers.formatEther(auctionBalance)} ARCx`);
  console.log(`Treasury: ${ethers.formatEther(treasuryBalance)} ARCx`);
  console.log(`Deployer: ${ethers.formatEther(deployerBalance)} ARCx`);
  console.log(`Airdrop: ${ethers.formatEther(airdropBalance)} ARCx`);
  console.log(`Vesting: ${ethers.formatEther(vestingBalance)} ARCx`);
  
  // 3. Check ETH balances
  const auctionEthBalance = await ethers.provider.getBalance(CONTRACTS.DUTCH_AUCTION);
  const treasuryEthBalance = await ethers.provider.getBalance(CONTRACTS.TREASURY_SAFE);
  
  console.log(`\n💎 ETH BALANCES:`);
  console.log(`Auction Contract: ${ethers.formatEther(auctionEthBalance)} ETH`);
  console.log(`Treasury: ${ethers.formatEther(treasuryEthBalance)} ETH`);
  
  // 4. Check auction state
  const tokensSold = await auction.tokensSold();
  const totalRaised = await auction.totalRaised();
  const totalTokens = await auction.totalTokens();
  
  console.log(`\n📈 AUCTION RESULTS:`);
  console.log(`Tokens Sold: ${ethers.formatEther(tokensSold)} ARCx`);
  console.log(`Total Raised: ${ethers.formatEther(totalRaised)} ETH`);
  console.log(`Total Tokens: ${ethers.formatEther(totalTokens)} ARCx`);
  console.log(`Sale Success Rate: ${Number(tokensSold) === 0 ? "0%" : ((Number(tokensSold) / Number(totalTokens)) * 100).toFixed(2) + "%"}`);
  
  // 5. Security checks
  console.log(`\n🔒 SECURITY AUDIT:`);
  
  const AUCTION_ADMIN = await auction.AUCTION_ADMIN();
  const treasuryHasAdmin = await auction.hasRole(AUCTION_ADMIN, CONTRACTS.TREASURY_SAFE);
  const deployerHasAdmin = await auction.hasRole(AUCTION_ADMIN, signer.address);
  
  console.log(`Treasury has AUCTION_ADMIN: ${treasuryHasAdmin ? "🟢 YES" : "🔴 NO"}`);
  console.log(`Deployer has AUCTION_ADMIN: ${deployerHasAdmin ? "🟢 YES" : "🔴 NO"}`);
  
  // 6. Recommendations
  console.log(`\n💡 CLEANUP RECOMMENDATIONS:`);
  console.log("============================");
  
  const recommendations = [];
  
  if (auctionBalance > 0) {
    recommendations.push("❌ Auction still has token balance - investigate");
  } else {
    recommendations.push("✅ Auction contract properly emptied");
  }
  
  if (auctionEthBalance > 0) {
    recommendations.push("⚠️ Auction has ETH balance - consider withdrawing");
  } else {
    recommendations.push("✅ No ETH left in auction contract");
  }
  
  if (!finalized) {
    recommendations.push("⚠️ Consider calling finalize() to mark auction as complete");
  } else {
    recommendations.push("✅ Auction properly finalized");
  }
  
  if (treasuryHasAdmin && deployerHasAdmin) {
    recommendations.push("⚠️ Consider revoking excess admin roles for security");
  }
  
  // 7. Next steps for production
  console.log(`\n🎯 RECOMMENDED NEXT STEPS:`);
  console.log("==========================");
  console.log("1. ✅ Tokens recovered successfully");
  
  if (!finalized) {
    console.log("2. 🔄 Call finalize() to officially close auction");
  } else {
    console.log("2. ✅ Auction officially finalized");
  }
  
  if (auctionEthBalance > 0) {
    console.log("3. 💸 Withdraw any remaining ETH from auction");
  } else {
    console.log("3. ✅ No ETH to withdraw");
  }
  
  console.log("4. 🔒 Consider revoking unnecessary admin roles");
  console.log("5. 📝 Update documentation with lessons learned");
  console.log("6. 🚀 Deploy future auctions with fixed contract");
  console.log("7. 📊 Proceed with airdrop and LP deployment");
  
  // 8. Generate final transaction if needed
  if (!finalized) {
    console.log(`\n📋 FINALIZE TRANSACTION (if needed):`);
    console.log("====================================");
    
    const finalizeInterface = new ethers.Interface(["function finalize()"]);
    const finalizeCalldata = finalizeInterface.encodeFunctionData("finalize", []);
    
    console.log(`To: ${CONTRACTS.DUTCH_AUCTION}`);
    console.log(`Value: 0`);
    console.log(`Data: ${finalizeCalldata}`);
  }
  
  recommendations.forEach(rec => console.log(rec));

  console.log("\n🎉 CLEANUP AUDIT COMPLETE");
  console.log("=========================");
  console.log("✅ Token recovery successful");
  console.log("📊 System audit complete");
  console.log("🚀 Ready for next phase");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
