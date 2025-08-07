// scripts/audit-trail.ts
// Comprehensive audit trail tracking every token from deployment to current state

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, validateNetwork } from "./shared/utils";

interface TokenTransfer {
  blockNumber: number;
  timestamp: Date;
  transactionHash: string;
  from: string;
  to: string;
  amount: bigint;
  amountFormatted: string;
  type: "MINT" | "TRANSFER" | "BURN";
  fromLabel?: string;
  toLabel?: string;
  gasUsed?: bigint;
  gasPrice?: bigint;
}

interface AddressBalance {
  address: string;
  label: string;
  balance: bigint;
  balanceFormatted: string;
  transactionCount: number;
  firstSeen?: Date;
  lastActive?: Date;
}

interface AuditSummary {
  totalMinted: bigint;
  totalBurned: bigint;
  totalTransfers: number;
  uniqueAddresses: number;
  contractDeployment: Date;
  auditDate: Date;
  balanceVerification: boolean;
}

class ARCxAuditTrail {
  private tokenContract: any;
  private transfers: TokenTransfer[] = [];
  private addressBalances: Map<string, AddressBalance> = new Map();
  private addressLabels: Map<string, string> = new Map();

  constructor() {
    // Initialize known address labels
    this.addressLabels.set(ethers.ZeroAddress, "ZERO_ADDRESS (Mint/Burn)");
    this.addressLabels.set(CONTRACTS.ARCX_TOKEN, "ARCx Token Contract");
    this.addressLabels.set(CONTRACTS.DUTCH_AUCTION, "Dutch Auction");
    this.addressLabels.set(CONTRACTS.SMART_AIRDROP, "Smart Airdrop");
    this.addressLabels.set(CONTRACTS.MASTER_VESTING, "Master Vesting");
    this.addressLabels.set(CONTRACTS.TREASURY_SAFE, "Treasury Safe");
    this.addressLabels.set(CONTRACTS.ECOSYSTEM_SAFE, "Ecosystem Safe");
    this.addressLabels.set(CONTRACTS.DEPLOYER, "Deployer");
    this.addressLabels.set("0x8F0b552065f120cF273CC077cdE4cD4578b5556c", "Unknown Address 1");
    this.addressLabels.set("0xD788D9ac56c754cb927771eBf058966bA8aB734D", "Unknown Address 2");
  }

  async initialize() {
    displayScriptHeader(
      "ARCx Complete Audit Trail",
      "Comprehensive tracking of every token from deployment to current state"
    );

    await validateNetwork();
    this.tokenContract = await ethers.getContractAt("ARCxToken", CONTRACTS.ARCX_TOKEN);
  }

  private getAddressLabel(address: string): string {
    return this.addressLabels.get(address) || `Unknown (${address.slice(0, 8)}...)`;
  }

  async collectAllTransfers() {
    console.log("\n🔍 COLLECTING ALL TOKEN TRANSFERS");
    console.log("=================================");

    // Get all Transfer events from contract deployment
    const transferEventTopic = ethers.id("Transfer(address,address,uint256)");
    
    try {
      const logs = await ethers.provider.getLogs({
        address: CONTRACTS.ARCX_TOKEN,
        topics: [transferEventTopic],
        fromBlock: 0,
        toBlock: "latest"
      });

      console.log(`Found ${logs.length} transfer events`);
      console.log("Processing transfer events...");

      for (const log of logs) {
        try {
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256"],
            log.data
          );
          const amount = decoded[0];
          const from = ethers.getAddress("0x" + log.topics[1].slice(26));
          const to = ethers.getAddress("0x" + log.topics[2].slice(26));

          // Get block details
          const block = await ethers.provider.getBlock(log.blockNumber);
          const transaction = await ethers.provider.getTransaction(log.transactionHash);
          const receipt = await ethers.provider.getTransactionReceipt(log.transactionHash);

          // Determine transfer type
          let type: "MINT" | "TRANSFER" | "BURN";
          if (from === ethers.ZeroAddress) {
            type = "MINT";
          } else if (to === ethers.ZeroAddress) {
            type = "BURN";
          } else {
            type = "TRANSFER";
          }

          const transfer: TokenTransfer = {
            blockNumber: log.blockNumber,
            timestamp: new Date(Number(block?.timestamp || 0) * 1000),
            transactionHash: log.transactionHash,
            from,
            to,
            amount,
            amountFormatted: ethers.formatEther(amount),
            type,
            fromLabel: this.getAddressLabel(from),
            toLabel: this.getAddressLabel(to),
            gasUsed: receipt?.gasUsed,
            gasPrice: transaction?.gasPrice
          };

          this.transfers.push(transfer);

          // Update address balances tracking
          this.updateAddressTracking(from, transfer.timestamp);
          this.updateAddressTracking(to, transfer.timestamp);

        } catch (error) {
          console.warn(`Error processing log at block ${log.blockNumber}:`, error);
        }
      }

      // Sort transfers by block number
      this.transfers.sort((a, b) => a.blockNumber - b.blockNumber);

      console.log(`✅ Processed ${this.transfers.length} transfers successfully`);

    } catch (error) {
      console.error("Error collecting transfers:", error);
      throw error;
    }
  }

  private updateAddressTracking(address: string, timestamp: Date) {
    if (address === ethers.ZeroAddress) return;

    if (!this.addressBalances.has(address)) {
      this.addressBalances.set(address, {
        address,
        label: this.getAddressLabel(address),
        balance: 0n,
        balanceFormatted: "0",
        transactionCount: 0,
        firstSeen: timestamp,
        lastActive: timestamp
      });
    }

    const existing = this.addressBalances.get(address)!;
    existing.transactionCount++;
    existing.lastActive = timestamp;
    if (!existing.firstSeen || timestamp < existing.firstSeen) {
      existing.firstSeen = timestamp;
    }
  }

  async getCurrentBalances() {
    console.log("\n💰 UPDATING CURRENT BALANCES");
    console.log("============================");

    for (const [address, info] of this.addressBalances.entries()) {
      try {
        const balance = await this.tokenContract.balanceOf(address);
        info.balance = balance;
        info.balanceFormatted = ethers.formatEther(balance);
      } catch (error) {
        console.warn(`Error getting balance for ${address}:`, error);
      }
    }

    console.log(`✅ Updated balances for ${this.addressBalances.size} addresses`);
  }

  displayTransferHistory() {
    console.log("\n📋 COMPLETE TRANSFER HISTORY");
    console.log("============================");

    let totalMinted = 0n;
    let totalBurned = 0n;
    let runningSupply = 0n;

    this.transfers.forEach((transfer, index) => {
      const prefix = `${(index + 1).toString().padStart(3)}.`;
      const block = `Block ${transfer.blockNumber}`;
      const date = transfer.timestamp.toISOString().split('T')[0];
      const time = transfer.timestamp.toISOString().split('T')[1].split('.')[0];

      console.log(`\n${prefix} ${block} | ${date} ${time}`);
      
      if (transfer.type === "MINT") {
        totalMinted += transfer.amount;
        runningSupply += transfer.amount;
        console.log(`    🟢 MINT: ${transfer.amountFormatted} ARCx → ${transfer.toLabel}`);
      } else if (transfer.type === "BURN") {
        totalBurned += transfer.amount;
        runningSupply -= transfer.amount;
        console.log(`    🔴 BURN: ${transfer.amountFormatted} ARCx ← ${transfer.fromLabel}`);
      } else {
        console.log(`    🔄 TRANSFER: ${transfer.amountFormatted} ARCx`);
        console.log(`       From: ${transfer.fromLabel}`);
        console.log(`       To:   ${transfer.toLabel}`);
      }

      console.log(`    📊 Running Supply: ${ethers.formatEther(runningSupply)} ARCx`);
      console.log(`    🔗 Tx: ${transfer.transactionHash}`);
      
      if (transfer.gasUsed) {
        console.log(`    ⛽ Gas: ${transfer.gasUsed.toString()} units`);
      }
    });

    console.log(`\n📊 TRANSFER SUMMARY`);
    console.log("===================");
    console.log(`Total Transfers: ${this.transfers.length}`);
    console.log(`Total Minted: ${ethers.formatEther(totalMinted)} ARCx`);
    console.log(`Total Burned: ${ethers.formatEther(totalBurned)} ARCx`);
    console.log(`Net Supply: ${ethers.formatEther(totalMinted - totalBurned)} ARCx`);
  }

  async displayAddressAnalysis() {
    console.log("\n👥 ADDRESS ANALYSIS");
    console.log("===================");

    // Sort by balance (descending)
    const sortedAddresses = Array.from(this.addressBalances.values())
      .sort((a, b) => Number(b.balance - a.balance));

    console.log(`Total Unique Addresses: ${sortedAddresses.length}`);
    console.log("\nCurrent Balances (Ranked):");

    const totalSupply = await this.tokenContract.totalSupply();

    sortedAddresses.forEach((addr, index) => {
      if (addr.balance > 0n) {
        const rank = (index + 1).toString().padStart(2);
        const balance = addr.balanceFormatted.padStart(12);
        const percentage = ((Number(addr.balanceFormatted) / Number(ethers.formatEther(totalSupply))) * 100).toFixed(2);
        
        console.log(`${rank}. ${addr.label.padEnd(25)}: ${balance} ARCx (${percentage}%)`);
        console.log(`    Address: ${addr.address}`);
        console.log(`    Transactions: ${addr.transactionCount}`);
        console.log(`    First seen: ${addr.firstSeen?.toISOString().split('T')[0] || 'Unknown'}`);
        console.log(`    Last active: ${addr.lastActive?.toISOString().split('T')[0] || 'Unknown'}`);
        console.log("");
      }
    });
  }

  async verifyBalanceIntegrity() {
    console.log("\n🔐 BALANCE INTEGRITY VERIFICATION");
    console.log("=================================");

    // Calculate expected balances from transfer history
    const calculatedBalances = new Map<string, bigint>();

    for (const transfer of this.transfers) {
      if (transfer.type === "MINT") {
        const current = calculatedBalances.get(transfer.to) || 0n;
        calculatedBalances.set(transfer.to, current + transfer.amount);
      } else if (transfer.type === "BURN") {
        const current = calculatedBalances.get(transfer.from) || 0n;
        calculatedBalances.set(transfer.from, current - transfer.amount);
      } else {
        // Regular transfer
        const fromCurrent = calculatedBalances.get(transfer.from) || 0n;
        const toCurrent = calculatedBalances.get(transfer.to) || 0n;
        calculatedBalances.set(transfer.from, fromCurrent - transfer.amount);
        calculatedBalances.set(transfer.to, toCurrent + transfer.amount);
      }
    }

    // Compare with actual balances
    let discrepancies = 0;
    for (const [address, actualBalance] of this.addressBalances.entries()) {
      const calculatedBalance = calculatedBalances.get(address) || 0n;
      
      if (actualBalance.balance !== calculatedBalance) {
        discrepancies++;
        console.log(`❌ DISCREPANCY: ${this.getAddressLabel(address)}`);
        console.log(`   Actual: ${ethers.formatEther(actualBalance.balance)} ARCx`);
        console.log(`   Calculated: ${ethers.formatEther(calculatedBalance)} ARCx`);
        console.log(`   Difference: ${ethers.formatEther(actualBalance.balance - calculatedBalance)} ARCx`);
      }
    }

    if (discrepancies === 0) {
      console.log("✅ PERFECT INTEGRITY: All balances match transfer history!");
    } else {
      console.log(`❌ ${discrepancies} discrepancies found`);
    }

    return discrepancies === 0;
  }

  async generateAuditSummary(): Promise<AuditSummary> {
    const totalSupply = await this.tokenContract.totalSupply();
    const deployedAt = await this.tokenContract.deployedAt();

    let totalMinted = 0n;
    let totalBurned = 0n;

    for (const transfer of this.transfers) {
      if (transfer.type === "MINT") {
        totalMinted += transfer.amount;
      } else if (transfer.type === "BURN") {
        totalBurned += transfer.amount;
      }
    }

    return {
      totalMinted,
      totalBurned,
      totalTransfers: this.transfers.length,
      uniqueAddresses: this.addressBalances.size,
      contractDeployment: new Date(Number(deployedAt) * 1000),
      auditDate: new Date(),
      balanceVerification: await this.verifyBalanceIntegrity()
    };
  }

  displayAuditSummary(summary: AuditSummary) {
    console.log("\n📊 COMPREHENSIVE AUDIT SUMMARY");
    console.log("==============================");
    
    console.log(`Contract Deployed: ${summary.contractDeployment.toISOString()}`);
    console.log(`Audit Date: ${summary.auditDate.toISOString()}`);
    console.log(`Days Since Deployment: ${Math.floor((summary.auditDate.getTime() - summary.contractDeployment.getTime()) / (1000 * 60 * 60 * 24))}`);
    
    console.log(`\nToken Metrics:`);
    console.log(`• Total Minted: ${ethers.formatEther(summary.totalMinted)} ARCx`);
    console.log(`• Total Burned: ${ethers.formatEther(summary.totalBurned)} ARCx`);
    console.log(`• Net Supply: ${ethers.formatEther(summary.totalMinted - summary.totalBurned)} ARCx`);
    
    console.log(`\nActivity Metrics:`);
    console.log(`• Total Transfers: ${summary.totalTransfers}`);
    console.log(`• Unique Addresses: ${summary.uniqueAddresses}`);
    console.log(`• Avg Transfers/Day: ${(summary.totalTransfers / Math.max(1, Math.floor((summary.auditDate.getTime() - summary.contractDeployment.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)}`);
    
    console.log(`\nIntegrity Check:`);
    console.log(`• Balance Verification: ${summary.balanceVerification ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (summary.balanceVerification) {
      console.log(`\n🎉 AUDIT COMPLETE: 100% TOKEN ACCOUNTABILITY ACHIEVED`);
      console.log(`Every single token has been tracked from mint to current location.`);
    } else {
      console.log(`\n⚠️  AUDIT INCOMPLETE: Discrepancies found`);
      console.log(`Manual review required for identified issues.`);
    }
  }
}

async function main() {
  const auditor = new ARCxAuditTrail();
  
  try {
    await auditor.initialize();
    await auditor.collectAllTransfers();
    await auditor.getCurrentBalances();
    
    auditor.displayTransferHistory();
    await auditor.displayAddressAnalysis();
    
    const summary = await auditor.generateAuditSummary();
    auditor.displayAuditSummary(summary);
    
  } catch (error) {
    console.error("💥 Audit failed:", error);
    process.exit(1);
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

export { ARCxAuditTrail, main as runCompleteAudit };
