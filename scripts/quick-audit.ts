// scripts/quick-audit.ts
// Quick audit summary for rapid token accountability verification

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, validateNetwork } from "./shared/utils";

async function main() {
  displayScriptHeader(
    "ARCx Quick Audit",
    "Rapid token accountability verification"
  );

  await validateNetwork();
  const tokenContract = await ethers.getContractAt("ARCxToken", CONTRACTS.ARCX_TOKEN);

  console.log("\n🔍 QUICK TOKEN ACCOUNTING");
  console.log("=========================");

  // Known addresses to check
  const addresses = [
    { label: "Master Vesting", address: CONTRACTS.MASTER_VESTING },
    { label: "Token Contract", address: CONTRACTS.ARCX_TOKEN },
    { label: "Treasury Safe", address: CONTRACTS.TREASURY_SAFE },
    { label: "Position Manager", address: CONTRACTS.POSITION_MANAGER },
    { label: "Unknown Address 1", address: "0x8F0b552065f120cF273CC077cdE4cD4578b5556c" },
    { label: "Unknown Address 2", address: "0xD788D9ac56c754cb927771eBf058966bA8aB734D" },
    { label: "Dutch Auction", address: CONTRACTS.DUTCH_AUCTION },
    { label: "Smart Airdrop", address: CONTRACTS.SMART_AIRDROP },
    { label: "Ecosystem Safe", address: CONTRACTS.ECOSYSTEM_SAFE },
    { label: "Deployer", address: CONTRACTS.DEPLOYER }
  ];

  let totalTracked = 0n;
  const balances: Array<{label: string, balance: bigint, percentage: number}> = [];

  // Get total supply
  const totalSupply = await tokenContract.totalSupply();
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ARCx`);
  console.log("");

  // Check each address
  for (const addr of addresses) {
    try {
      const balance = await tokenContract.balanceOf(addr.address);
      if (balance > 0n) {
        totalTracked += balance;
        const percentage = (Number(ethers.formatEther(balance)) / Number(ethers.formatEther(totalSupply))) * 100;
        balances.push({ label: addr.label, balance, percentage });
      }
    } catch (error) {
      console.warn(`Error checking ${addr.label}:`, error);
    }
  }

  // Sort by balance
  balances.sort((a, b) => Number(b.balance - a.balance));

  // Display results
  balances.forEach((entry, index) => {
    const rank = (index + 1).toString().padStart(2);
    const formattedBalance = ethers.formatEther(entry.balance).padStart(10);
    const percent = entry.percentage.toFixed(2).padStart(6);
    console.log(`${rank}. ${entry.label.padEnd(20)}: ${formattedBalance} ARCx (${percent}%)`);
  });

  console.log("");
  console.log("📊 ACCOUNTABILITY SUMMARY");
  console.log("=========================");
  console.log(`Total Tracked: ${ethers.formatEther(totalTracked)} ARCx`);
  console.log(`Total Supply:  ${ethers.formatEther(totalSupply)} ARCx`);
  console.log(`Untracked:     ${ethers.formatEther(totalSupply - totalTracked)} ARCx`);
  
  const accountabilityPercentage = (Number(ethers.formatEther(totalTracked)) / Number(ethers.formatEther(totalSupply))) * 100;
  console.log(`Accountability: ${accountabilityPercentage.toFixed(2)}%`);

  if (accountabilityPercentage >= 99.99) {
    console.log("✅ PERFECT ACCOUNTABILITY: All tokens accounted for!");
  } else if (accountabilityPercentage >= 95) {
    console.log("🟡 GOOD ACCOUNTABILITY: Most tokens tracked");
  } else {
    console.log("🔴 POOR ACCOUNTABILITY: Significant tokens untracked");
  }

  // Check if minting is still possible
  const isPaused = await tokenContract.paused();
  const isFinalized = await tokenContract.mintingFinalized();
  
  console.log("\n🔒 CONTRACT STATUS");
  console.log("==================");
  console.log(`Paused: ${isPaused ? "Yes" : "No"}`);
  console.log(`Minting Finalized: ${isFinalized ? "Yes" : "No"}`);
  console.log(`Max Supply: ${ethers.formatEther(await tokenContract.MAX_SUPPLY())} ARCx`);

  if (isFinalized) {
    console.log("🔐 Minting permanently disabled - Ultra-scarce tokenomics active");
  } else {
    console.log("⚠️  Minting still possible - Supply could increase");
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as runQuickAudit };
