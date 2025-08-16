// scripts/finalize-auction.ts
// Finalize the Dutch auction and withdraw unsold tokens back to treasury

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, getTokenContract } from "./shared/utils";

async function main() {
  displayScriptHeader(
    "ARCx Auction Finalization",
    "Finalize auction and withdraw unsold tokens to treasury"
  );

  const [signer] = await ethers.getSigners();
  console.log(`\n🔐 Signer: ${signer.address}`);

  // Get auction contract
  const auction = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
  
  // Check current status
  console.log("\n📊 CURRENT AUCTION STATUS");
  console.log("==========================");
  
  const finalized = await auction.finalized();
  const tokensSold = await auction.tokensSold();
  const totalTokens = await auction.totalTokens();
  const endTime = await auction.endTime();
  const treasury = await auction.treasury();
  
  console.log(`✅ Finalized: ${finalized ? "🟢 YES" : "🔴 NO"}`);
  console.log(`✅ Tokens Sold: ${ethers.formatEther(tokensSold)} ARCx`);
  console.log(`✅ Total Tokens: ${ethers.formatEther(totalTokens)} ARCx`);
  console.log(`✅ End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
  console.log(`✅ Treasury: ${treasury}`);
  
  // Check current contract token balance
  const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
  const contractBalance = await token.balanceOf(CONTRACTS.DUTCH_AUCTION);
  console.log(`✅ Contract Token Balance: ${ethers.formatEther(contractBalance)} ARCx`);
  
  if (finalized) {
    console.log("\n✅ Auction is already finalized!");
    return;
  }
  
  const remainingTokens = totalTokens - tokensSold;
  console.log(`\n💡 Remaining tokens to withdraw: ${ethers.formatEther(remainingTokens)} ARCx`);
  
  // Check if auction can be finalized
  const currentTime = Math.floor(Date.now() / 1000);
  const auctionEnded = currentTime >= Number(endTime);
  const allTokensSold = tokensSold >= totalTokens;
  
  if (!auctionEnded && !allTokensSold) {
    console.log("\n❌ Cannot finalize: Auction is still active");
    console.log(`   Current time: ${new Date(currentTime * 1000).toISOString()}`);
    console.log(`   End time: ${new Date(Number(endTime) * 1000).toISOString()}`);
    return;
  }
  
  console.log("\n🎯 FINALIZING AUCTION");
  console.log("=====================");
  
  try {
    // Check if signer has AUCTION_ADMIN role
    const AUCTION_ADMIN = await auction.AUCTION_ADMIN();
    const hasRole = await auction.hasRole(AUCTION_ADMIN, signer.address);
    
    if (!hasRole) {
      console.log(`❌ Signer ${signer.address} does not have AUCTION_ADMIN role`);
      console.log(`   Required role: ${AUCTION_ADMIN}`);
      return;
    }
    
    console.log("✅ Signer has AUCTION_ADMIN role");
    
    // Estimate gas
    const gasEstimate = await auction.finalize.estimateGas();
    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
    
    // Execute finalize
    console.log("\n🚀 Executing finalize transaction...");
    const tx = await auction.finalize({
      gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
    });
    
    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt?.status === 1) {
      console.log("✅ Auction finalized successfully!");
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check final balances
      const finalContractBalance = await token.balanceOf(CONTRACTS.DUTCH_AUCTION);
      const treasuryBalance = await token.balanceOf(treasury);
      
      console.log("\n📊 FINAL BALANCES");
      console.log("==================");
      console.log(`✅ Auction Contract: ${ethers.formatEther(finalContractBalance)} ARCx`);
      console.log(`✅ Treasury: ${ethers.formatEther(treasuryBalance)} ARCx`);
      
    } else {
      console.log("❌ Transaction failed!");
    }
    
  } catch (error: any) {
    console.log(`❌ Error finalizing auction: ${error.message}`);
    
    if (error.message.includes("Already finalized")) {
      console.log("ℹ️ Auction was already finalized");
    } else if (error.message.includes("Auction still active")) {
      console.log("ℹ️ Auction is still active and cannot be finalized yet");
    }
  }

  console.log("\n🎉 FINALIZATION COMPLETE");
  console.log("========================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
