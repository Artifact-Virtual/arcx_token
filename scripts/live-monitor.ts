// scripts/live-monitor.ts
// Comprehensive live monitoring system for ARCx ecosystem

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, validateNetwork } from "./shared/utils";

interface SystemStatus {
  timestamp: Date;
  blockNumber: number;
  
  // Token Contract
  tokenActive: boolean;
  tokenPaused: boolean;
  mintingFinalized: boolean;
  totalSupply: bigint;
  
  // Auction Status
  auctionActive: boolean;
  auctionPaused: boolean;
  auctionProgress: number;
  currentPrice: bigint;
  tokensRemaining: bigint;
  
  // Treasury Health
  treasuryBalance: bigint;
  ecosystemBalance: bigint;
  
  // Critical Alerts
  alerts: string[];
  warnings: string[];
}

interface WalletConnection {
  address: string;
  label: string;
  lastSeen: Date;
  transactionCount: number;
  arcxBalance: bigint;
  ethBalance: bigint;
}

class LiveMonitor {
  private tokenContract: any;
  private auctionContract: any;
  private walletConnections: Map<string, WalletConnection> = new Map();
  private lastAlert: Date = new Date(0);

  constructor() {
    // Initialize known wallet tracking
    this.initializeWalletTracking();
  }

  private initializeWalletTracking() {
    const knownWallets = [
      { address: CONTRACTS.TREASURY_SAFE, label: "Treasury Safe" },
      { address: CONTRACTS.ECOSYSTEM_SAFE, label: "Ecosystem Safe" },
      { address: CONTRACTS.DEPLOYER, label: "Deployer" },
      { address: CONTRACTS.DUTCH_AUCTION, label: "Dutch Auction" },
      { address: CONTRACTS.SMART_AIRDROP, label: "Smart Airdrop" },
      { address: CONTRACTS.MASTER_VESTING, label: "Master Vesting" },
      { address: "0x8F0b552065f120cF273CC077cdE4cD4578b5556c", label: "Unknown Address 1" },
      { address: "0xD788D9ac56c754cb927771eBf058966bA8aB734D", label: "Unknown Address 2" }
    ];

    for (const wallet of knownWallets) {
      this.walletConnections.set(wallet.address, {
        address: wallet.address,
        label: wallet.label,
        lastSeen: new Date(),
        transactionCount: 0,
        arcxBalance: 0n,
        ethBalance: 0n
      });
    }
  }

  async initialize() {
    displayScriptHeader(
      "ARCx Live Ecosystem Monitor",
      "Real-time comprehensive system monitoring and alerts"
    );

    await validateNetwork();
    
    try {
      this.tokenContract = await ethers.getContractAt("ARCxToken", CONTRACTS.ARCX_TOKEN);
      this.auctionContract = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
      console.log("✅ Monitoring systems initialized");
    } catch (error) {
      console.error("❌ Failed to initialize monitoring:", error);
      throw error;
    }
  }

  async collectSystemStatus(): Promise<SystemStatus> {
    const currentBlock = await ethers.provider.getBlock("latest");
    const alerts: string[] = [];
    const warnings: string[] = [];

    // Token Contract Status
    const tokenPaused = await this.tokenContract.paused();
    const mintingFinalized = await this.tokenContract.mintingFinalized();
    const totalSupply = await this.tokenContract.totalSupply();
    const tokenActive = !tokenPaused;

    // Auction Status
    let auctionActive = false;
    let auctionPaused = false;
    let auctionProgress = 0;
    let currentPrice = 0n;
    let tokensRemaining = 0n;

    try {
      auctionPaused = await this.auctionContract.paused();
      const startTime = Number(await this.auctionContract.startTime());
      const endTime = Number(await this.auctionContract.endTime());
      const now = Math.floor(Date.now() / 1000);
      auctionActive = now >= startTime && now <= endTime && !auctionPaused;
      
      const totalTokens = await this.auctionContract.totalTokens();
      const tokensSold = await this.auctionContract.tokensSold();
      tokensRemaining = totalTokens - tokensSold;
      auctionProgress = Number(tokensSold) / Number(totalTokens) * 100;
      
      currentPrice = await this.auctionContract.getCurrentPrice();
    } catch (error) {
      warnings.push("Could not fetch auction status");
    }

    // Treasury Health
    const treasuryBalance = await ethers.provider.getBalance(CONTRACTS.TREASURY_SAFE);
    const ecosystemBalance = await ethers.provider.getBalance(CONTRACTS.ECOSYSTEM_SAFE);

    // Generate alerts
    if (tokenPaused) alerts.push("🔴 CRITICAL: Token contract is paused");
    if (auctionActive && auctionPaused) alerts.push("🔴 CRITICAL: Auction is paused while active");
    if (treasuryBalance < ethers.parseEther("0.001")) warnings.push("⚠️ Treasury ETH balance low");
    if (ecosystemBalance === 0n) warnings.push("⚠️ Ecosystem Safe has zero ETH");

    return {
      timestamp: new Date(),
      blockNumber: currentBlock?.number || 0,
      tokenActive,
      tokenPaused,
      mintingFinalized,
      totalSupply,
      auctionActive,
      auctionPaused,
      auctionProgress,
      currentPrice,
      tokensRemaining,
      treasuryBalance,
      ecosystemBalance,
      alerts,
      warnings
    };
  }

  async updateWalletConnections() {
    console.log("\n💳 WALLET CONNECTION STATUS");
    console.log("============================");

    for (const [address, connection] of this.walletConnections.entries()) {
      try {
        // Update balances
        connection.arcxBalance = await this.tokenContract.balanceOf(address);
        connection.ethBalance = await ethers.provider.getBalance(address);
        
        // Get transaction count as activity indicator
        connection.transactionCount = await ethers.provider.getTransactionCount(address);
        connection.lastSeen = new Date();

        console.log(`${connection.label.padEnd(20)}: ${ethers.formatEther(connection.arcxBalance).padStart(12)} ARCx | ${ethers.formatEther(connection.ethBalance).padStart(12)} ETH | ${connection.transactionCount} txs`);

      } catch (error) {
        console.warn(`Error updating ${connection.label}:`, error);
      }
    }
  }

  async scanForNewTransactions() {
    console.log("\n🔍 RECENT TRANSACTION SCAN");
    console.log("===========================");

    try {
      // Get recent Transfer events (last 100 blocks)
      const currentBlock = await ethers.provider.getBlock("latest");
      const fromBlock = Math.max(0, (currentBlock?.number || 0) - 100);
      
      const transferEventTopic = ethers.id("Transfer(address,address,uint256)");
      
      const logs = await ethers.provider.getLogs({
        address: CONTRACTS.ARCX_TOKEN,
        topics: [transferEventTopic],
        fromBlock,
        toBlock: "latest"
      });

      if (logs.length === 0) {
        console.log("No recent token transfers found");
        return;
      }

      console.log(`Found ${logs.length} recent transfers:`);
      
      for (const log of logs.slice(-5)) { // Show last 5 transfers
        try {
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
          const amount = decoded[0];
          const from = ethers.getAddress("0x" + log.topics[1].slice(26));
          const to = ethers.getAddress("0x" + log.topics[2].slice(26));
          
          const fromLabel = this.getWalletLabel(from);
          const toLabel = this.getWalletLabel(to);
          
          console.log(`  Block ${log.blockNumber}: ${ethers.formatEther(amount)} ARCx | ${fromLabel} → ${toLabel}`);
          
        } catch (error) {
          console.warn(`Error processing transfer at block ${log.blockNumber}`);
        }
      }

    } catch (error) {
      console.error("Error scanning transactions:", error);
    }
  }

  private getWalletLabel(address: string): string {
    const connection = this.walletConnections.get(address);
    if (connection) return connection.label;
    if (address === ethers.ZeroAddress) return "ZERO_ADDRESS";
    return `${address.slice(0, 8)}...`;
  }

  async generateDashboard() {
    console.log("\n📊 LIVE ECOSYSTEM DASHBOARD");
    console.log("============================");

    const status = await this.collectSystemStatus();
    
    // System Status
    console.log(`🕐 Update Time: ${status.timestamp.toISOString()}`);
    console.log(`📦 Block: ${status.blockNumber}`);
    console.log(`🪙 Token: ${status.tokenActive ? '🟢 Active' : '🔴 Inactive'} | Minting: ${status.mintingFinalized ? '🔒 Finalized' : '🟡 Open'}`);
    console.log(`🎯 Auction: ${status.auctionActive ? '🟢 Active' : '🔴 Inactive'} | Progress: ${status.auctionProgress.toFixed(2)}%`);
    console.log(`💰 Price: ${ethers.formatEther(status.currentPrice)} ETH/ARCx`);
    console.log(`🏦 Treasury: ${ethers.formatEther(status.treasuryBalance)} ETH`);

    // Alerts Section
    if (status.alerts.length > 0) {
      console.log(`\n🚨 CRITICAL ALERTS:`);
      status.alerts.forEach(alert => console.log(`   ${alert}`));
    }

    if (status.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      status.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (status.alerts.length === 0 && status.warnings.length === 0) {
      console.log(`\n✅ ALL SYSTEMS OPERATIONAL`);
    }

    // Update wallet connections and recent activity
    await this.updateWalletConnections();
    await this.scanForNewTransactions();

    return status;
  }

  async runContinuousMonitoring(intervalMinutes: number = 5) {
    console.log(`\n🔄 Starting continuous monitoring (${intervalMinutes} minute intervals)`);
    console.log("Press Ctrl+C to stop monitoring");

    while (true) {
      try {
        await this.generateDashboard();
        console.log(`\n⏰ Next update in ${intervalMinutes} minutes...`);
        await new Promise(resolve => setTimeout(resolve, intervalMinutes * 60 * 1000));
      } catch (error) {
        console.error("❌ Monitoring error:", error);
        console.log("Retrying in 1 minute...");
        await new Promise(resolve => setTimeout(resolve, 60 * 1000));
      }
    }
  }
}

async function main() {
  const monitor = new LiveMonitor();
  
  try {
    await monitor.initialize();
    
    // Check if we want continuous monitoring
    const args = process.argv.slice(2);
    if (args.includes('--continuous')) {
      const intervalIndex = args.indexOf('--interval');
      const interval = intervalIndex !== -1 ? parseInt(args[intervalIndex + 1]) || 5 : 5;
      await monitor.runContinuousMonitoring(interval);
    } else {
      await monitor.generateDashboard();
      console.log(`\n💡 TIP: Run with --continuous for live monitoring`);
      console.log(`💡 TIP: Use --continuous --interval 10 for 10-minute intervals`);
    }
    
  } catch (error) {
    console.error("💥 Live monitoring failed:", error);
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

export { LiveMonitor, main as runLiveMonitor };
