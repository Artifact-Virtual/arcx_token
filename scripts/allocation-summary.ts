// scripts/token-allocation-summary.ts
// Complete summary of all ARCx token allocations

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, validateNetwork } from "./shared/utils";

async function main() {
  displayScriptHeader(
    "ARCx Token Allocation Summary",
    "Complete breakdown of all ARCx tokens across the ecosystem"
  );

  await validateNetwork();

  const [deployer] = await ethers.getSigners();
  const tokenContract = await ethers.getContractAt("ARCxToken", CONTRACTS.ARCX_TOKEN);

  console.log("\nTOKEN CONTRACT OVERVIEW");
  console.log("=======================");
  
  const totalSupply = await tokenContract.totalSupply();
  const maxSupply = await tokenContract.MAX_SUPPLY();
  const mintingFinalized = await tokenContract.mintingFinalized();
  
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ARCx`);
  console.log(`Max Supply: ${ethers.formatEther(maxSupply)} ARCx`);
  console.log(`Minting Finalized: ${mintingFinalized}`);
  console.log(`Supply Utilization: ${(Number(ethers.formatEther(totalSupply)) / Number(ethers.formatEther(maxSupply)) * 100).toFixed(2)}%`);

  console.log("\nTOKEN ALLOCATION BREAKDOWN");
  console.log("==========================");

  // Check all known addresses including newly discovered ones
  const addresses = {
    "Deployer": deployer.address,
    "Dutch Auction": CONTRACTS.DUTCH_AUCTION,
    "Smart Airdrop": CONTRACTS.SMART_AIRDROP,
    "Master Vesting": CONTRACTS.MASTER_VESTING,
    "Treasury Safe": CONTRACTS.TREASURY_SAFE,
    "Ecosystem Safe": CONTRACTS.ECOSYSTEM_SAFE,
    "Unknown Address 1": "0x8F0b552065f120cF273CC077cdE4cD4578b5556c",
    "Unknown Address 2": "0xD788D9ac56c754cb927771eBf058966bA8aB734D",
    "Token Contract": CONTRACTS.ARCX_TOKEN, // Tokens sent back to contract
  };

  let totalAllocated = 0n;
  const allocations = [];

  for (const [name, address] of Object.entries(addresses)) {
    try {
      const balance = await tokenContract.balanceOf(address);
      const balanceFormatted = Number(ethers.formatEther(balance));
      totalAllocated += balance;
      
      allocations.push({
        name,
        address,
        balance: balanceFormatted,
        percentage: (balanceFormatted / Number(ethers.formatEther(totalSupply)) * 100)
      });
      
      console.log(`${name.padEnd(20)}: ${balanceFormatted.toLocaleString().padStart(12)} ARCx (${(balanceFormatted / Number(ethers.formatEther(totalSupply)) * 100).toFixed(2)}%)`);
      console.log(`${"".padEnd(20)}  ${address}`);
    } catch (error) {
      console.log(`${name.padEnd(20)}: Error reading balance`);
    }
  }

  console.log("\nALLOCATION SUMMARY");
  console.log("==================");
  
  const totalAllocatedFormatted = Number(ethers.formatEther(totalAllocated));
  const unaccountedTokens = Number(ethers.formatEther(totalSupply)) - totalAllocatedFormatted;
  
  console.log(`Total Accounted: ${totalAllocatedFormatted.toLocaleString()} ARCx`);
  console.log(`Total Supply: ${Number(ethers.formatEther(totalSupply)).toLocaleString()} ARCx`);
  console.log(`Unaccounted: ${unaccountedTokens.toLocaleString()} ARCx`);
  
  if (unaccountedTokens > 0.000001) {
    console.log(`\n⚠️  WARNING: ${unaccountedTokens.toLocaleString()} ARCx unaccounted for`);
    console.log("These tokens may be in other addresses or burned");
  } else if (unaccountedTokens < -0.000001) {
    console.log(`\n⚠️  WARNING: Over-accounted by ${Math.abs(unaccountedTokens).toLocaleString()} ARCx`);
    console.log("This suggests double-counting or data errors");
  } else {
    console.log(`\n✅ ALL TOKENS ACCOUNTED FOR: Perfect balance!`);
  }

  console.log("\nDISTRIBUTION ANALYSIS");
  console.log("=====================");
  
  // Sort by balance
  allocations.sort((a, b) => b.balance - a.balance);
  
  console.log("Ranked by token holdings:");
  allocations.forEach((alloc, index) => {
    if (alloc.balance > 0) {
      console.log(`${(index + 1).toString().padStart(2)}. ${alloc.name.padEnd(20)}: ${alloc.balance.toLocaleString().padStart(12)} ARCx (${alloc.percentage.toFixed(2)}%)`);
    }
  });

  console.log("\nFUNCTIONAL BREAKDOWN");
  console.log("====================");
  
  const functional = {
    "Available for Sale": allocations.find(a => a.name === "Dutch Auction")?.balance || 0,
    "Reserved for Airdrop": allocations.find(a => a.name === "Smart Airdrop")?.balance || 0,
    "Locked in Vesting": allocations.find(a => a.name === "Master Vesting")?.balance || 0,
    "Treasury Holdings": allocations.find(a => a.name === "Treasury Safe")?.balance || 0,
    "Ecosystem Reserve": allocations.find(a => a.name === "Ecosystem Safe")?.balance || 0,
    "Deployer/Working": allocations.find(a => a.name === "Deployer")?.balance || 0,
    "Unknown Holdings": (allocations.find(a => a.name === "Unknown Address 1")?.balance || 0) + 
                        (allocations.find(a => a.name === "Unknown Address 2")?.balance || 0),
    "Contract Holdings": allocations.find(a => a.name === "Token Contract")?.balance || 0,
  };

  Object.entries(functional).forEach(([purpose, amount]) => {
    if (amount > 0) {
      console.log(`${purpose.padEnd(25)}: ${amount.toLocaleString().padStart(12)} ARCx`);
    }
  });

  console.log("\nSCARCITY METRICS");
  console.log("================");
  
  const scarcityMetrics = {
    "Total Minted": Number(ethers.formatEther(totalSupply)),
    "Never to be Minted": Number(ethers.formatEther(maxSupply)) - Number(ethers.formatEther(totalSupply)),
    "Circulating Supply": totalAllocatedFormatted,
    "Locked in Contracts": functional["Reserved for Airdrop"] + functional["Locked in Vesting"] + functional["Available for Sale"],
    "Freely Tradeable": functional["Treasury Holdings"] + functional["Ecosystem Reserve"] + functional["Deployer/Working"],
    "Unknown/External": functional["Unknown Holdings"] + functional["Contract Holdings"],
  };

  Object.entries(scarcityMetrics).forEach(([metric, value]) => {
    console.log(`${metric.padEnd(25)}: ${value.toLocaleString().padStart(12)} ARCx`);
  });

  console.log("\nKEY INSIGHTS");
  console.log("============");
  
  const insights = [
    `🔒 ${((scarcityMetrics["Never to be Minted"] / Number(ethers.formatEther(maxSupply))) * 100).toFixed(1)}% of max supply will NEVER exist`,
    `📈 Only ${((scarcityMetrics["Total Minted"] / Number(ethers.formatEther(maxSupply))) * 100).toFixed(1)}% of max supply has been minted`,
    `🏪 ${((functional["Available for Sale"] / scarcityMetrics["Total Minted"]) * 100).toFixed(1)}% available for public sale`,
    `🎁 ${((functional["Reserved for Airdrop"] / scarcityMetrics["Total Minted"]) * 100).toFixed(1)}% reserved for community airdrop`,
    `⏰ ${((functional["Locked in Vesting"] / scarcityMetrics["Total Minted"]) * 100).toFixed(1)}% locked in vesting (releasing over time)`,
    `💰 ${((scarcityMetrics["Freely Tradeable"] / scarcityMetrics["Total Minted"]) * 100).toFixed(1)}% currently tradeable`,
    `🔐 ${((scarcityMetrics["Locked in Contracts"] / scarcityMetrics["Total Minted"]) * 100).toFixed(1)}% locked in smart contracts`,
  ];

  insights.forEach(insight => console.log(insight));
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as getTokenAllocationSummary };
