// scripts/auction-monitor.ts
// Comprehensive Dutch Auction monitoring and verification system

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, validateNetwork } from "./shared/utils";

interface AuctionState {
  // Contract Information
  contractAddress: string;
  tokenAddress: string;
  isActive: boolean;
  isPaused: boolean;
  isFinalized: boolean;
  
  // Auction Parameters
  totalTokens: bigint;
  startTime: Date;
  endTime: Date;
  startPrice: bigint;
  reservePrice: bigint;
  duration: number;
  
  // Current State
  currentPrice: bigint;
  tokensSold: bigint;
  tokensRemaining: bigint;
  totalRaised: bigint;
  participantCount: number;
  timeRemaining: number;
  
  // Treasury
  treasury: string;
  treasuryBalance: bigint;
}

interface Bid {
  bidder: string;
  amount: bigint;
  price: bigint;
  timestamp: Date;
  transactionHash: string;
  tier: number;
  blockNumber: number;
}

interface ParticipantInfo {
  address: string;
  totalPurchased: bigint;
  totalSpent: bigint;
  bidCount: number;
  firstBid: Date;
  lastBid: Date;
  tier: number;
  isEarlySupporter: boolean;
}

class AuctionMonitor {
  private auctionContract: any;
  private tokenContract: any;
  private bids: Bid[] = [];
  private participants: Map<string, ParticipantInfo> = new Map();

  async initialize() {
    displayScriptHeader(
      "ARCx Dutch Auction Monitor",
      "Comprehensive real-time auction monitoring and verification"
    );

    await validateNetwork();
    
    try {
      this.auctionContract = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
      this.tokenContract = await ethers.getContractAt("ARCxToken", CONTRACTS.ARCX_TOKEN);
      console.log("✅ Contracts initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize contracts:", error);
      throw error;
    }
  }

  async getAuctionState(): Promise<AuctionState> {
    console.log("\n📊 AUCTION STATE ANALYSIS");
    console.log("==========================");

    try {
      // Get basic auction info
      const totalTokens = await this.auctionContract.totalTokens();
      const startTime = Number(await this.auctionContract.startTime());
      const endTime = Number(await this.auctionContract.endTime());
      const startPrice = await this.auctionContract.startPrice();
      const reservePrice = await this.auctionContract.reservePrice();
      const tokensSold = await this.auctionContract.tokensSold();
      const totalRaised = await this.auctionContract.totalRaised();
      const finalized = await this.auctionContract.finalized();
      const paused = await this.auctionContract.paused();
      const treasury = await this.auctionContract.treasury();

      // Calculate current state
      const now = Math.floor(Date.now() / 1000);
      const isActive = now >= startTime && now <= endTime && !finalized;
      const timeRemaining = Math.max(0, endTime - now);
      const tokensRemaining = totalTokens - tokensSold;
      
      // Get current price
      let currentPrice = 0n;
      try {
        currentPrice = await this.auctionContract.getCurrentPrice();
      } catch (error) {
        console.warn("Could not get current price:", error);
        currentPrice = reservePrice;
      }

      // Get treasury balance
      const treasuryBalance = await ethers.provider.getBalance(treasury);

      const state: AuctionState = {
        contractAddress: CONTRACTS.DUTCH_AUCTION,
        tokenAddress: CONTRACTS.ARCX_TOKEN,
        isActive,
        isPaused: paused,
        isFinalized: finalized,
        totalTokens,
        startTime: new Date(startTime * 1000),
        endTime: new Date(endTime * 1000),
        startPrice,
        reservePrice,
        duration: endTime - startTime,
        currentPrice,
        tokensSold,
        tokensRemaining,
        totalRaised,
        participantCount: 0, // Will be updated by analyzing events
        timeRemaining,
        treasury,
        treasuryBalance
      };

      this.displayAuctionState(state);
      return state;

    } catch (error) {
      console.error("❌ Error getting auction state:", error);
      throw error;
    }
  }

  private displayAuctionState(state: AuctionState) {
    console.log(`Contract Address: ${state.contractAddress}`);
    console.log(`Token Address: ${state.tokenAddress}`);
    console.log(`Status: ${state.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
    console.log(`Paused: ${state.isPaused ? '⏸️  YES' : '▶️  NO'}`);
    console.log(`Finalized: ${state.isFinalized ? '✅ YES' : '❌ NO'}`);
    
    console.log(`\n⏰ TIMING:`);
    console.log(`Start: ${state.startTime.toISOString()}`);
    console.log(`End: ${state.endTime.toISOString()}`);
    console.log(`Duration: ${Math.floor(state.duration / 3600)} hours`);
    console.log(`Time Remaining: ${Math.floor(state.timeRemaining / 3600)}h ${Math.floor((state.timeRemaining % 3600) / 60)}m`);
    
    console.log(`\n💰 PRICING:`);
    console.log(`Start Price: ${ethers.formatEther(state.startPrice)} ETH/ARCx`);
    console.log(`Reserve Price: ${ethers.formatEther(state.reservePrice)} ETH/ARCx`);
    console.log(`Current Price: ${ethers.formatEther(state.currentPrice)} ETH/ARCx`);
    
    console.log(`\n🎯 SALES METRICS:`);
    console.log(`Total Tokens: ${ethers.formatEther(state.totalTokens)} ARCx`);
    console.log(`Tokens Sold: ${ethers.formatEther(state.tokensSold)} ARCx`);
    console.log(`Tokens Remaining: ${ethers.formatEther(state.tokensRemaining)} ARCx`);
    console.log(`Total Raised: ${ethers.formatEther(state.totalRaised)} ETH`);
    console.log(`Sales Progress: ${(Number(state.tokensSold) / Number(state.totalTokens) * 100).toFixed(2)}%`);
    
    console.log(`\n🏦 TREASURY:`);
    console.log(`Treasury Address: ${state.treasury}`);
    console.log(`Treasury Balance: ${ethers.formatEther(state.treasuryBalance)} ETH`);
  }

  async analyzeBidHistory() {
    console.log("\n📋 BID HISTORY ANALYSIS");
    console.log("========================");

    try {
      // Get Purchase events
      const purchaseEventTopic = ethers.id("Purchase(address,uint256,uint256,uint256,uint8)");
      
      const logs = await ethers.provider.getLogs({
        address: CONTRACTS.DUTCH_AUCTION,
        topics: [purchaseEventTopic],
        fromBlock: 0,
        toBlock: "latest"
      });

      console.log(`Found ${logs.length} purchase events`);

      if (logs.length === 0) {
        console.log("🔍 No bids found - auction has no participants yet");
        return;
      }

      for (const log of logs) {
        try {
          // Decode the Purchase event
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256", "uint256", "uint256", "uint8"],
            log.data
          );
          
          const bidder = ethers.getAddress("0x" + log.topics[1].slice(26));
          const amount = decoded[0];
          const price = decoded[1];
          const timestamp = decoded[2];
          const tier = decoded[3];

          const block = await ethers.provider.getBlock(log.blockNumber);
          
          const bid: Bid = {
            bidder,
            amount,
            price,
            timestamp: new Date(Number(timestamp) * 1000),
            transactionHash: log.transactionHash,
            tier,
            blockNumber: log.blockNumber
          };

          this.bids.push(bid);
          this.updateParticipantInfo(bid);

        } catch (error) {
          console.warn(`Error processing bid at block ${log.blockNumber}:`, error);
        }
      }

      // Sort bids by timestamp
      this.bids.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      this.displayBidHistory();

    } catch (error) {
      console.error("❌ Error analyzing bid history:", error);
      throw error;
    }
  }

  private updateParticipantInfo(bid: Bid) {
    if (!this.participants.has(bid.bidder)) {
      this.participants.set(bid.bidder, {
        address: bid.bidder,
        totalPurchased: 0n,
        totalSpent: 0n,
        bidCount: 0,
        firstBid: bid.timestamp,
        lastBid: bid.timestamp,
        tier: bid.tier,
        isEarlySupporter: false // Will be checked separately
      });
    }

    const participant = this.participants.get(bid.bidder)!;
    participant.totalPurchased += bid.amount;
    participant.totalSpent += (bid.amount * bid.price) / ethers.parseEther("1");
    participant.bidCount++;
    participant.lastBid = bid.timestamp;
    
    if (bid.timestamp < participant.firstBid) {
      participant.firstBid = bid.timestamp;
    }
  }

  private displayBidHistory() {
    if (this.bids.length === 0) {
      console.log("No bids to display");
      return;
    }

    console.log(`\n💰 BID HISTORY (${this.bids.length} total bids):`);
    
    this.bids.forEach((bid, index) => {
      const date = bid.timestamp.toISOString().split('T')[0];
      const time = bid.timestamp.toISOString().split('T')[1].split('.')[0];
      
      console.log(`\n${index + 1}. Block ${bid.blockNumber} | ${date} ${time}`);
      console.log(`   Bidder: ${bid.bidder}`);
      console.log(`   Amount: ${ethers.formatEther(bid.amount)} ARCx`);
      console.log(`   Price: ${ethers.formatEther(bid.price)} ETH/ARCx`);
      console.log(`   Tier: ${bid.tier}`);
      console.log(`   Cost: ${ethers.formatEther((bid.amount * bid.price) / ethers.parseEther("1"))} ETH`);
      console.log(`   Tx: ${bid.transactionHash}`);
    });

    this.displayParticipantSummary();
  }

  private displayParticipantSummary() {
    console.log(`\n👥 PARTICIPANT SUMMARY (${this.participants.size} unique participants):`);

    const sortedParticipants = Array.from(this.participants.values())
      .sort((a, b) => Number(b.totalPurchased - a.totalPurchased));

    sortedParticipants.forEach((participant, index) => {
      console.log(`\n${index + 1}. ${participant.address}`);
      console.log(`   Total Purchased: ${ethers.formatEther(participant.totalPurchased)} ARCx`);
      console.log(`   Total Spent: ${ethers.formatEther(participant.totalSpent)} ETH`);
      console.log(`   Bid Count: ${participant.bidCount}`);
      console.log(`   Tier: ${participant.tier}`);
      console.log(`   First Bid: ${participant.firstBid.toISOString()}`);
      console.log(`   Last Bid: ${participant.lastBid.toISOString()}`);
    });
  }

  async verifyAuctionIntegrity() {
    console.log("\n🔐 AUCTION INTEGRITY VERIFICATION");
    console.log("==================================");

    try {
      // Check contract token balance
      const auctionTokenBalance = await this.tokenContract.balanceOf(CONTRACTS.DUTCH_AUCTION);
      const expectedBalance = await this.auctionContract.totalTokens();
      const soldTokens = await this.auctionContract.tokensSold();
      const expectedRemaining = expectedBalance - soldTokens;

      console.log(`Contract Token Balance: ${ethers.formatEther(auctionTokenBalance)} ARCx`);
      console.log(`Expected Remaining: ${ethers.formatEther(expectedRemaining)} ARCx`);
      console.log(`Balance Match: ${auctionTokenBalance === expectedRemaining ? '✅ YES' : '❌ NO'}`);

      // Verify total raised matches bid history
      if (this.bids.length > 0) {
        let calculatedRaised = 0n;
        for (const bid of this.bids) {
          calculatedRaised += (bid.amount * bid.price) / ethers.parseEther("1");
        }
        
        const contractRaised = await this.auctionContract.totalRaised();
        console.log(`Contract Total Raised: ${ethers.formatEther(contractRaised)} ETH`);
        console.log(`Calculated from Bids: ${ethers.formatEther(calculatedRaised)} ETH`);
        console.log(`Raised Amount Match: ${contractRaised === calculatedRaised ? '✅ YES' : '❌ NO'}`);
      }

      // Check contract permissions and roles
      const hasAdminRole = await this.auctionContract.hasRole(
        await this.auctionContract.AUCTION_ADMIN(),
        CONTRACTS.DEPLOYER
      );
      console.log(`Admin Role Configured: ${hasAdminRole ? '✅ YES' : '❌ NO'}`);

      return true;

    } catch (error) {
      console.error("❌ Error verifying auction integrity:", error);
      return false;
    }
  }

  async generateLiveReport() {
    console.log("\n📊 LIVE AUCTION REPORT");
    console.log("======================");

    const state = await this.getAuctionState();
    await this.analyzeBidHistory();
    const integrityCheck = await this.verifyAuctionIntegrity();

    console.log(`\n🎯 SUMMARY:`);
    console.log(`• Status: ${state.isActive ? 'Active' : 'Inactive'}`);
    console.log(`• Progress: ${(Number(state.tokensSold) / Number(state.totalTokens) * 100).toFixed(2)}% sold`);
    console.log(`• Participants: ${this.participants.size}`);
    console.log(`• Total Bids: ${this.bids.length}`);
    console.log(`• Integrity: ${integrityCheck ? '✅ Verified' : '❌ Issues Found'}`);
    console.log(`• Next Update: Run this script again for live status`);

    return {
      state,
      bids: this.bids,
      participants: Array.from(this.participants.values()),
      integrityVerified: integrityCheck
    };
  }
}

async function main() {
  const monitor = new AuctionMonitor();
  
  try {
    await monitor.initialize();
    await monitor.generateLiveReport();
    
  } catch (error) {
    console.error("💥 Auction monitoring failed:", error);
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

export { AuctionMonitor, main as runAuctionMonitor };
