// scripts/status.ts
// Consolidated status checker replacing multiple redundant status scripts
// Replaces: quick_status.ts, final_status.ts, deep_status.ts, current_deployment_status.ts

import { ethers } from "hardhat";
import { CONTRACTS, AMOUNTS } from "./shared/constants";
import { 
  displayScriptHeader, 
  getAllContractStatuses, 
  printContractStatusTable,
  getTokenContract,
  safeContractCall,
  formatTimestamp,
  formatTimeRemaining
} from "./shared/utils";

async function main() {
  displayScriptHeader(
    "ARCx Ecosystem Status Check",
    "Comprehensive status overview of all ARCx contracts and operations"
  );

  // Get basic contract deployment status
  console.log("\n📍 CONTRACT DEPLOYMENT STATUS");
  console.log("==============================");
  const contractStatuses = await getAllContractStatuses();
  printContractStatusTable(contractStatuses);

  // Check token status
  await checkTokenStatus();
  
  // Check auction status  
  await checkAuctionStatus();
  
  // Check airdrop status
  await checkAirdropStatus();
  
  // Check vesting status
  await checkVestingStatus();
  
  // Check treasury status
  await checkTreasuryStatus();
  
  // Check liquidity status
  await checkLiquidityStatus();

  console.log("\n🎉 STATUS CHECK COMPLETE");
  console.log("========================");
}

async function checkTokenStatus() {
  console.log("\n🪙 ARCx TOKEN STATUS");
  console.log("===================");
  
  try {
    const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
    
    const name = await safeContractCall(() => token.name(), "Failed to get token name");
    const symbol = await safeContractCall(() => token.symbol(), "Failed to get token symbol");
    const totalSupply = await safeContractCall(() => token.totalSupply(), "Failed to get total supply");
    const maxSupply = await safeContractCall(() => token.MAX_SUPPLY(), "Failed to get max supply");
    const paused = await safeContractCall(() => token.paused(), "Failed to get pause status");
    const mintingFinalized = await safeContractCall(() => token.mintingFinalized(), "Failed to get minting status");
    
    if (name) console.log(`✅ Name: ${name}`);
    if (symbol) console.log(`✅ Symbol: ${symbol}`);
    if (totalSupply) console.log(`✅ Total Supply: ${ethers.formatEther(totalSupply)} ARCx`);
    if (maxSupply) console.log(`✅ Max Supply: ${ethers.formatEther(maxSupply)} ARCx`);
    if (paused !== null) console.log(`✅ Paused: ${paused ? "🔴 YES" : "🟢 NO"}`);
    if (mintingFinalized !== null) console.log(`✅ Minting Finalized: ${mintingFinalized ? "🔒 YES" : "🔓 NO"}`);
    
  } catch (error: any) {
    console.log(`❌ Token status check failed: ${error.message}`);
  }
}

async function checkAuctionStatus() {
  console.log("\n🎯 DUTCH AUCTION STATUS");
  console.log("=======================");
  
  try {
    const auction = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
    
    // Check if auction has getAuctionStatus function
    const auctionStatus = await safeContractCall(
      () => auction.getAuctionStatus(),
      "Failed to get auction status"
    );
    
    if (auctionStatus) {
      const startTime = await safeContractCall(() => auction.startTime(), "Failed to get start time");
      const endTime = await safeContractCall(() => auction.endTime(), "Failed to get end time");
      
      console.log(`✅ Status: ${auctionStatus._isActive ? "🟢 ACTIVE" : "🔴 INACTIVE"}`);
      console.log(`✅ Tokens Sold: ${ethers.formatEther(auctionStatus._tokensSold)} ARCx`);
      console.log(`✅ Tokens Remaining: ${ethers.formatEther(auctionStatus._tokensRemaining)} ARCx`);
      console.log(`✅ Current Price: ${ethers.formatEther(auctionStatus._currentPrice)} ETH/ARCx`);
      console.log(`✅ Total Raised: ${ethers.formatEther(auctionStatus._totalRaised)} ETH`);
      
      if (startTime) console.log(`✅ Start Time: ${formatTimestamp(Number(startTime))}`);
      if (endTime) console.log(`✅ End Time: ${formatTimestamp(Number(endTime))}`);
      
      if (auctionStatus._isActive && auctionStatus._timeRemaining > 0) {
        console.log(`⏱️ Time Remaining: ${formatTimeRemaining(Number(auctionStatus._timeRemaining))}`);
      }
    }
    
    // Check contract token balance
    const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
    const auctionBalance = await safeContractCall(
      () => token.balanceOf(CONTRACTS.DUTCH_AUCTION),
      "Failed to get auction token balance"
    );
    
    if (auctionBalance !== null) {
      console.log(`✅ Contract Token Balance: ${ethers.formatEther(auctionBalance)} ARCx`);
    }
    
  } catch (error: any) {
    console.log(`❌ Auction status check failed: ${error.message}`);
  }
}

async function checkAirdropStatus() {
  console.log("\n🎁 SMART AIRDROP STATUS");
  console.log("======================");
  
  try {
    const airdrop = await ethers.getContractAt("ARCxSmartAirdrop", CONTRACTS.SMART_AIRDROP);
    
    const totalTokens = await safeContractCall(() => airdrop.totalTokens(), "Failed to get total tokens");
    const claimDeadline = await safeContractCall(() => airdrop.claimDeadline(), "Failed to get claim deadline");
    const merkleRoot = await safeContractCall(() => airdrop.merkleRoot(), "Failed to get merkle root");
    
    if (totalTokens) console.log(`✅ Total Tokens: ${ethers.formatEther(totalTokens)} ARCx`);
    if (claimDeadline) console.log(`✅ Claim Deadline: ${formatTimestamp(Number(claimDeadline))}`);
    if (merkleRoot) {
      const isDefaultRoot = merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000001";
      console.log(`✅ Merkle Root: ${isDefaultRoot ? "🔴 DEFAULT (NOT SET)" : "🟢 CONFIGURED"}`);
    }
    
    // Check contract token balance
    const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
    const airdropBalance = await safeContractCall(
      () => token.balanceOf(CONTRACTS.SMART_AIRDROP),
      "Failed to get airdrop token balance"
    );
    
    if (airdropBalance !== null) {
      console.log(`✅ Contract Token Balance: ${ethers.formatEther(airdropBalance)} ARCx`);
    }
    
  } catch (error: any) {
    console.log(`❌ Airdrop status check failed: ${error.message}`);
  }
}

async function checkVestingStatus() {
  console.log("\n📅 VESTING CONTRACT STATUS");
  console.log("==========================");
  
  try {
    const vesting = await ethers.getContractAt("ARCxMasterVesting", CONTRACTS.MASTER_VESTING);
    
    const globalVestingStart = await safeContractCall(
      () => vesting.globalVestingStart(),
      "Failed to get vesting start"
    );
    const contractStats = await safeContractCall(
      () => vesting.getContractStats(),
      "Failed to get contract stats"
    );
    const paused = await safeContractCall(() => vesting.paused(), "Failed to get pause status");
    
    if (globalVestingStart) {
      console.log(`✅ Vesting Start: ${formatTimestamp(Number(globalVestingStart))}`);
    }
    
    if (contractStats) {
      console.log(`✅ Total Allocated: ${ethers.formatEther(contractStats.totalAllocated_)} ARCx`);
      console.log(`✅ Total Released: ${ethers.formatEther(contractStats.totalReleased_)} ARCx`);
      console.log(`✅ Contract Balance: ${ethers.formatEther(contractStats.contractBalance)} ARCx`);
    }
    
    if (paused !== null) {
      console.log(`✅ Paused: ${paused ? "🔴 YES" : "🟢 NO"}`);
    }
    
  } catch (error: any) {
    console.log(`❌ Vesting status check failed: ${error.message}`);
  }
}

async function checkTreasuryStatus() {
  console.log("\n🏦 TREASURY STATUS");
  console.log("==================");
  
  try {
    const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
    
    // Treasury Safe balance
    const treasuryBalance = await safeContractCall(
      () => token.balanceOf(CONTRACTS.TREASURY_SAFE),
      "Failed to get treasury balance"
    );
    
    const treasuryEthBalance = await ethers.provider.getBalance(CONTRACTS.TREASURY_SAFE);
    
    // Ecosystem Safe balance  
    const ecosystemBalance = await safeContractCall(
      () => token.balanceOf(CONTRACTS.ECOSYSTEM_SAFE),
      "Failed to get ecosystem balance"
    );
    
    if (treasuryBalance !== null) {
      console.log(`✅ Treasury ARCx: ${ethers.formatEther(treasuryBalance)} ARCx`);
    }
    console.log(`✅ Treasury ETH: ${ethers.formatEther(treasuryEthBalance)} ETH`);
    
    if (ecosystemBalance !== null) {
      console.log(`✅ Ecosystem ARCx: ${ethers.formatEther(ecosystemBalance)} ARCx`);
    }
    
  } catch (error: any) {
    console.log(`❌ Treasury status check failed: ${error.message}`);
  }
}

async function checkLiquidityStatus() {
  console.log("\n🏊 LIQUIDITY STATUS");
  console.log("==================");
  
  // Check Uniswap V4 contracts
  const v4Contracts = [
    { name: "Pool Manager", address: CONTRACTS.POOL_MANAGER },
    { name: "Position Manager", address: CONTRACTS.POSITION_MANAGER },
    { name: "Universal Router", address: CONTRACTS.UNIVERSAL_ROUTER },
  ];
  
  for (const contract of v4Contracts) {
    const code = await ethers.provider.getCode(contract.address);
    const isDeployed = code !== "0x";
    console.log(`${isDeployed ? "✅" : "❌"} ${contract.name}: ${isDeployed ? "DEPLOYED" : "NOT DEPLOYED"}`);
  }
  
  // Note: Pool status checking would require V4 SDK integration
  console.log("ℹ️ Pool status requires V4 SDK integration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
