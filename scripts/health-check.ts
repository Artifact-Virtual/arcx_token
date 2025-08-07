// scripts/health-check.ts
// Comprehensive ARCx Ecosystem Health Monitor
// Complete status check of all contracts, tokens, and safes

import { ethers } from "hardhat";
import { CONTRACTS, AMOUNTS, NETWORK } from "./shared/constants";
import { 
  displayScriptHeader, 
  getTokenContract,
  safeContractCall,
  formatTimestamp,
  formatTimeRemaining,
  isContractDeployed 
} from "./shared/utils";

interface HealthStatus {
  category: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";
  message: string;
  details?: any;
}

interface ContractHealth {
  name: string;
  address: string;
  isDeployed: boolean;
  ethBalance: string;
  tokenBalance?: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  issues: string[];
  data?: any;
}

class ARCxHealthMonitor {
  private healthChecks: HealthStatus[] = [];
  private contractStatuses: ContractHealth[] = [];

  async runFullHealthCheck() {
    displayScriptHeader(
      "ARCx Ecosystem Health Monitor",
      "Comprehensive health check of all contracts, tokens, and safes"
    );

    // Core health checks
    await this.checkNetworkHealth();
    await this.checkTokenHealth();
    await this.checkAuctionHealth();
    await this.checkAirdropHealth();
    await this.checkVestingHealth();
    await this.checkTreasuryHealth();
    await this.checkEcosystemSafeHealth();
    await this.checkLiquidityInfrastructure();
    
    // Generate health report
    this.generateHealthReport();
  }

  private async checkNetworkHealth() {
    console.log("\n🌐 NETWORK HEALTH CHECK");
    console.log("=======================");
    
    try {
      const network = await ethers.provider.getNetwork();
      const blockNumber = await ethers.provider.getBlockNumber();
      const gasPrice = await ethers.provider.getFeeData();
      
      if (network.chainId === NETWORK.CHAIN_ID) {
        this.addHealthCheck("Network", "HEALTHY", `Connected to Base Mainnet (Block: ${blockNumber})`);
        console.log(`✅ Network: Base Mainnet (Chain ID: ${network.chainId})`);
        console.log(`✅ Latest Block: ${blockNumber}`);
        console.log(`✅ Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 0n, "gwei")} gwei`);
      } else {
        this.addHealthCheck("Network", "CRITICAL", `Wrong network: Chain ID ${network.chainId}`);
        console.log(`❌ Wrong Network: Chain ID ${network.chainId}`);
      }
    } catch (error: any) {
      this.addHealthCheck("Network", "CRITICAL", `Network error: ${error.message}`);
      console.log(`❌ Network Error: ${error.message}`);
    }
  }

  private async checkTokenHealth() {
    console.log("\n🪙 ARCx TOKEN HEALTH CHECK");
    console.log("==========================");
    
    try {
      const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
      const contractBalance = await ethers.provider.getBalance(CONTRACTS.ARCX_TOKEN);
      
      // Basic token info
      const name = await safeContractCall(() => token.name(), "Failed to get name");
      const symbol = await safeContractCall(() => token.symbol(), "Failed to get symbol");
      const totalSupply = await safeContractCall(() => token.totalSupply(), "Failed to get total supply");
      const maxSupply = await safeContractCall(() => token.MAX_SUPPLY(), "Failed to get max supply");
      const paused = await safeContractCall(() => token.paused(), "Failed to get pause status");
      const mintingFinalized = await safeContractCall(() => token.mintingFinalized(), "Failed to get minting status");
      
      const issues: string[] = [];
      let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
      
      // Health checks
      if (paused) {
        issues.push("Contract is paused");
        status = "WARNING";
      }
      
      if (totalSupply && maxSupply) {
        const supplyRatio = Number(totalSupply) / Number(maxSupply);
        if (supplyRatio > 0.95) {
          issues.push("Total supply near max supply");
          status = "WARNING";
        }
      }
      
      console.log(`✅ Name: ${name}`);
      console.log(`✅ Symbol: ${symbol}`);
      console.log(`✅ Total Supply: ${totalSupply ? ethers.formatEther(totalSupply) : 'Unknown'} ARCx`);
      console.log(`✅ Max Supply: ${maxSupply ? ethers.formatEther(maxSupply) : 'Unknown'} ARCx`);
      console.log(`${paused ? '⚠️' : '✅'} Paused: ${paused ? 'YES' : 'NO'}`);
      console.log(`${mintingFinalized ? '✅' : '⚠️'} Minting Finalized: ${mintingFinalized ? 'YES' : 'NO'}`);
      
      this.contractStatuses.push({
        name: "ARCx Token",
        address: CONTRACTS.ARCX_TOKEN,
        isDeployed: true,
        ethBalance: ethers.formatEther(contractBalance),
        status: status,
        issues: issues,
        data: { name, symbol, totalSupply, maxSupply, paused, mintingFinalized }
      });
      
      this.addHealthCheck("Token Contract", status, 
        issues.length > 0 ? issues.join(", ") : "Token contract healthy");
        
    } catch (error: any) {
      console.log(`❌ Token Health Check Failed: ${error.message}`);
      this.addHealthCheck("Token Contract", "CRITICAL", `Token check failed: ${error.message}`);
    }
  }

  private async checkAuctionHealth() {
    console.log("\n🎯 DUTCH AUCTION HEALTH CHECK");
    console.log("=============================");
    
    try {
      const isDeployed = await isContractDeployed(CONTRACTS.DUTCH_AUCTION);
      const contractBalance = await ethers.provider.getBalance(CONTRACTS.DUTCH_AUCTION);
      
      if (!isDeployed) {
        console.log("❌ Dutch Auction contract not deployed");
        this.addHealthCheck("Dutch Auction", "CRITICAL", "Contract not deployed");
        return;
      }
      
      const auction = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
      const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
      
      // Get auction status
      const auctionStatus = await safeContractCall(() => auction.getAuctionStatus(), "Failed to get auction status");
      const tokenBalance = await safeContractCall(() => token.balanceOf(CONTRACTS.DUTCH_AUCTION), "Failed to get token balance");
      const startTime = await safeContractCall(() => auction.startTime(), "Failed to get start time");
      const endTime = await safeContractCall(() => auction.endTime(), "Failed to get end time");
      const finalized = await safeContractCall(() => auction.finalized(), "Failed to get finalized status");
      
      const issues: string[] = [];
      let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
      
      // Health analysis
      if (auctionStatus) {
        const currentTime = Math.floor(Date.now() / 1000);
        const hasStarted = currentTime >= Number(startTime || 0);
        const hasEnded = currentTime >= Number(endTime || 0);
        
        console.log(`${auctionStatus._isActive ? '🟢' : '🔴'} Status: ${auctionStatus._isActive ? 'ACTIVE' : 'INACTIVE'}`);
        console.log(`✅ Tokens Sold: ${ethers.formatEther(auctionStatus._tokensSold)} ARCx`);
        console.log(`✅ Tokens Remaining: ${ethers.formatEther(auctionStatus._tokensRemaining)} ARCx`);
        console.log(`✅ Current Price: ${ethers.formatEther(auctionStatus._currentPrice)} ETH/ARCx`);
        console.log(`✅ Total Raised: ${ethers.formatEther(auctionStatus._totalRaised)} ETH`);
        
        if (startTime && endTime) {
          console.log(`✅ Start Time: ${formatTimestamp(Number(startTime))}`);
          console.log(`✅ End Time: ${formatTimestamp(Number(endTime))}`);
        }
        
        // Check for issues
        if (hasEnded && !finalized) {
          issues.push("Auction ended but not finalized");
          status = "WARNING";
        }
        
        if (tokenBalance && Number(tokenBalance) === 0 && auctionStatus._isActive) {
          issues.push("No tokens in active auction contract");
          status = "CRITICAL";
        }
        
        if (auctionStatus._timeRemaining > 0) {
          console.log(`⏱️ Time Remaining: ${formatTimeRemaining(Number(auctionStatus._timeRemaining))}`);
        }
      }
      
      console.log(`✅ Contract ETH Balance: ${ethers.formatEther(contractBalance)} ETH`);
      console.log(`✅ Contract Token Balance: ${tokenBalance ? ethers.formatEther(tokenBalance) : 'Unknown'} ARCx`);
      console.log(`${finalized ? '✅' : '⚠️'} Finalized: ${finalized ? 'YES' : 'NO'}`);
      
      this.contractStatuses.push({
        name: "Dutch Auction",
        address: CONTRACTS.DUTCH_AUCTION,
        isDeployed: true,
        ethBalance: ethers.formatEther(contractBalance),
        tokenBalance: tokenBalance ? ethers.formatEther(tokenBalance) : undefined,
        status: status,
        issues: issues,
        data: auctionStatus
      });
      
      this.addHealthCheck("Dutch Auction", status, 
        issues.length > 0 ? issues.join(", ") : "Auction contract healthy");
        
    } catch (error: any) {
      console.log(`❌ Auction Health Check Failed: ${error.message}`);
      this.addHealthCheck("Dutch Auction", "CRITICAL", `Auction check failed: ${error.message}`);
    }
  }

  private async checkAirdropHealth() {
    console.log("\n🎁 SMART AIRDROP HEALTH CHECK");
    console.log("=============================");
    
    try {
      const isDeployed = await isContractDeployed(CONTRACTS.SMART_AIRDROP);
      const contractBalance = await ethers.provider.getBalance(CONTRACTS.SMART_AIRDROP);
      
      if (!isDeployed) {
        console.log("❌ Smart Airdrop contract not deployed");
        this.addHealthCheck("Smart Airdrop", "CRITICAL", "Contract not deployed");
        return;
      }
      
      const airdrop = await ethers.getContractAt("ARCxSmartAirdrop", CONTRACTS.SMART_AIRDROP);
      const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
      
      const totalTokens = await safeContractCall(() => airdrop.totalTokens(), "Failed to get total tokens");
      const claimDeadline = await safeContractCall(() => airdrop.claimDeadline(), "Failed to get claim deadline");
      const merkleRoot = await safeContractCall(() => airdrop.merkleRoot(), "Failed to get merkle root");
      const tokenBalance = await safeContractCall(() => token.balanceOf(CONTRACTS.SMART_AIRDROP), "Failed to get token balance");
      
      const issues: string[] = [];
      let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
      
      // Health analysis
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = claimDeadline && currentTime > Number(claimDeadline);
      const isDefaultRoot = merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000001";
      
      if (isDefaultRoot) {
        issues.push("Merkle root not set (using default)");
        status = "WARNING";
      }
      
      if (isExpired) {
        issues.push("Claim period has expired");
        status = "WARNING";
      }
      
      if (tokenBalance && Number(tokenBalance) === 0) {
        issues.push("No tokens in airdrop contract");
        status = "CRITICAL";
      }
      
      console.log(`✅ Total Tokens: ${totalTokens ? ethers.formatEther(totalTokens) : 'Unknown'} ARCx`);
      console.log(`${isExpired ? '🔴' : '🟢'} Claim Deadline: ${claimDeadline ? formatTimestamp(Number(claimDeadline)) : 'Unknown'}`);
      console.log(`${isDefaultRoot ? '🔴' : '🟢'} Merkle Root: ${isDefaultRoot ? 'NOT SET' : 'CONFIGURED'}`);
      console.log(`✅ Contract Token Balance: ${tokenBalance ? ethers.formatEther(tokenBalance) : 'Unknown'} ARCx`);
      
      this.contractStatuses.push({
        name: "Smart Airdrop",
        address: CONTRACTS.SMART_AIRDROP,
        isDeployed: true,
        ethBalance: ethers.formatEther(contractBalance),
        tokenBalance: tokenBalance ? ethers.formatEther(tokenBalance) : undefined,
        status: status,
        issues: issues,
        data: { totalTokens, claimDeadline, merkleRoot, isExpired, isDefaultRoot }
      });
      
      this.addHealthCheck("Smart Airdrop", status, 
        issues.length > 0 ? issues.join(", ") : "Airdrop contract healthy");
        
    } catch (error: any) {
      console.log(`❌ Airdrop Health Check Failed: ${error.message}`);
      this.addHealthCheck("Smart Airdrop", "CRITICAL", `Airdrop check failed: ${error.message}`);
    }
  }

  private async checkVestingHealth() {
    console.log("\n📅 VESTING CONTRACT HEALTH CHECK");
    console.log("================================");
    
    try {
      const isDeployed = await isContractDeployed(CONTRACTS.MASTER_VESTING);
      const contractBalance = await ethers.provider.getBalance(CONTRACTS.MASTER_VESTING);
      
      if (!isDeployed) {
        console.log("❌ Vesting contract not deployed");
        this.addHealthCheck("Vesting Contract", "CRITICAL", "Contract not deployed");
        return;
      }
      
      const vesting = await ethers.getContractAt("ARCxMasterVesting", CONTRACTS.MASTER_VESTING);
      const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
      
      const globalVestingStart = await safeContractCall(() => vesting.globalVestingStart(), "Failed to get vesting start");
      const contractStats = await safeContractCall(() => vesting.getContractStats(), "Failed to get contract stats");
      const paused = await safeContractCall(() => vesting.paused(), "Failed to get pause status");
      const tokenBalance = await safeContractCall(() => token.balanceOf(CONTRACTS.MASTER_VESTING), "Failed to get token balance");
      
      const issues: string[] = [];
      let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
      
      // Health analysis
      if (paused) {
        issues.push("Vesting contract is paused");
        status = "WARNING";
      }
      
      if (contractStats) {
        const allocated = Number(contractStats.totalAllocated_);
        const balance = Number(contractStats.contractBalance);
        
        if (allocated > balance && balance > 0) {
          issues.push("Allocated tokens exceed contract balance");
          status = "WARNING";
        }
        
        if (allocated > 0 && balance === 0) {
          issues.push("Tokens allocated but no balance in contract");
          status = "CRITICAL";
        }
      }
      
      console.log(`✅ Vesting Start: ${globalVestingStart ? formatTimestamp(Number(globalVestingStart)) : 'Unknown'}`);
      console.log(`${paused ? '⚠️' : '✅'} Paused: ${paused ? 'YES' : 'NO'}`);
      
      if (contractStats) {
        console.log(`✅ Total Allocated: ${ethers.formatEther(contractStats.totalAllocated_)} ARCx`);
        console.log(`✅ Total Released: ${ethers.formatEther(contractStats.totalReleased_)} ARCx`);
        console.log(`✅ Contract Balance: ${ethers.formatEther(contractStats.contractBalance)} ARCx`);
      }
      
      this.contractStatuses.push({
        name: "Master Vesting",
        address: CONTRACTS.MASTER_VESTING,
        isDeployed: true,
        ethBalance: ethers.formatEther(contractBalance),
        tokenBalance: contractStats ? ethers.formatEther(contractStats.contractBalance) : undefined,
        status: status,
        issues: issues,
        data: { globalVestingStart, contractStats, paused }
      });
      
      this.addHealthCheck("Vesting Contract", status, 
        issues.length > 0 ? issues.join(", ") : "Vesting contract healthy");
        
    } catch (error: any) {
      console.log(`❌ Vesting Health Check Failed: ${error.message}`);
      this.addHealthCheck("Vesting Contract", "CRITICAL", `Vesting check failed: ${error.message}`);
    }
  }

  private async checkTreasuryHealth() {
    console.log("\n🏦 TREASURY SAFE HEALTH CHECK");
    console.log("=============================");
    
    try {
      const treasuryEthBalance = await ethers.provider.getBalance(CONTRACTS.TREASURY_SAFE);
      const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
      const treasuryTokenBalance = await safeContractCall(
        () => token.balanceOf(CONTRACTS.TREASURY_SAFE), 
        "Failed to get treasury token balance"
      );
      
      const issues: string[] = [];
      let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
      
      // Health analysis
      const ethBalanceNum = Number(ethers.formatEther(treasuryEthBalance));
      const tokenBalanceNum = treasuryTokenBalance ? Number(ethers.formatEther(treasuryTokenBalance)) : 0;
      
      if (ethBalanceNum < 0.01) {
        issues.push("Low ETH balance for gas fees");
        status = "WARNING";
      }
      
      if (ethBalanceNum < 0.001) {
        issues.push("Critical ETH balance - cannot execute transactions");
        status = "CRITICAL";
      }
      
      // Check if treasury has sufficient tokens for planned operations
      const requiredLPTokens = Number(AMOUNTS.LP_ARCX);
      if (tokenBalanceNum < requiredLPTokens) {
        issues.push(`Insufficient ARCx for LP operations (need ${requiredLPTokens})`);
        status = "WARNING";
      }
      
      console.log(`✅ Address: ${CONTRACTS.TREASURY_SAFE}`);
      console.log(`${ethBalanceNum < 0.001 ? '🔴' : ethBalanceNum < 0.01 ? '⚠️' : '✅'} ETH Balance: ${ethers.formatEther(treasuryEthBalance)} ETH`);
      console.log(`✅ ARCx Balance: ${treasuryTokenBalance ? ethers.formatEther(treasuryTokenBalance) : 'Unknown'} ARCx`);
      
      this.contractStatuses.push({
        name: "Treasury Safe",
        address: CONTRACTS.TREASURY_SAFE,
        isDeployed: true, // Assume safe is deployed if we can check balance
        ethBalance: ethers.formatEther(treasuryEthBalance),
        tokenBalance: treasuryTokenBalance ? ethers.formatEther(treasuryTokenBalance) : undefined,
        status: status,
        issues: issues
      });
      
      this.addHealthCheck("Treasury Safe", status, 
        issues.length > 0 ? issues.join(", ") : "Treasury safe healthy");
        
    } catch (error: any) {
      console.log(`❌ Treasury Health Check Failed: ${error.message}`);
      this.addHealthCheck("Treasury Safe", "CRITICAL", `Treasury check failed: ${error.message}`);
    }
  }

  private async checkEcosystemSafeHealth() {
    console.log("\n🌱 ECOSYSTEM SAFE HEALTH CHECK");
    console.log("==============================");
    
    try {
      const ecosystemEthBalance = await ethers.provider.getBalance(CONTRACTS.ECOSYSTEM_SAFE);
      const token = await getTokenContract(CONTRACTS.ARCX_TOKEN);
      const ecosystemTokenBalance = await safeContractCall(
        () => token.balanceOf(CONTRACTS.ECOSYSTEM_SAFE), 
        "Failed to get ecosystem token balance"
      );
      
      const issues: string[] = [];
      let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
      
      // Health analysis
      const ethBalanceNum = Number(ethers.formatEther(ecosystemEthBalance));
      
      if (ethBalanceNum < 0.001) {
        issues.push("Low ETH balance for operations");
        status = "WARNING";
      }
      
      console.log(`✅ Address: ${CONTRACTS.ECOSYSTEM_SAFE}`);
      console.log(`${ethBalanceNum < 0.001 ? '⚠️' : '✅'} ETH Balance: ${ethers.formatEther(ecosystemEthBalance)} ETH`);
      console.log(`✅ ARCx Balance: ${ecosystemTokenBalance ? ethers.formatEther(ecosystemTokenBalance) : 'Unknown'} ARCx`);
      
      this.contractStatuses.push({
        name: "Ecosystem Safe",
        address: CONTRACTS.ECOSYSTEM_SAFE,
        isDeployed: true,
        ethBalance: ethers.formatEther(ecosystemEthBalance),
        tokenBalance: ecosystemTokenBalance ? ethers.formatEther(ecosystemTokenBalance) : undefined,
        status: status,
        issues: issues
      });
      
      this.addHealthCheck("Ecosystem Safe", status, 
        issues.length > 0 ? issues.join(", ") : "Ecosystem safe healthy");
        
    } catch (error: any) {
      console.log(`❌ Ecosystem Safe Health Check Failed: ${error.message}`);
      this.addHealthCheck("Ecosystem Safe", "CRITICAL", `Ecosystem safe check failed: ${error.message}`);
    }
  }

  private async checkLiquidityInfrastructure() {
    console.log("\n🦄 LIQUIDITY INFRASTRUCTURE HEALTH");
    console.log("==================================");
    
    const v4Contracts = [
      { name: "Pool Manager", address: CONTRACTS.POOL_MANAGER },
      { name: "Position Manager", address: CONTRACTS.POSITION_MANAGER },
      { name: "Universal Router", address: CONTRACTS.UNIVERSAL_ROUTER },
    ];
    
    let allHealthy = true;
    
    for (const contract of v4Contracts) {
      const isDeployed = await isContractDeployed(contract.address);
      const balance = await ethers.provider.getBalance(contract.address);
      
      console.log(`${isDeployed ? '✅' : '❌'} ${contract.name}: ${isDeployed ? 'DEPLOYED' : 'NOT DEPLOYED'}`);
      console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
      
      if (!isDeployed) {
        allHealthy = false;
      }
      
      this.contractStatuses.push({
        name: contract.name,
        address: contract.address,
        isDeployed: isDeployed,
        ethBalance: ethers.formatEther(balance),
        status: isDeployed ? "HEALTHY" : "CRITICAL",
        issues: isDeployed ? [] : ["Contract not deployed"]
      });
    }
    
    // Check WETH balance
    const wethBalance = await ethers.provider.getBalance(CONTRACTS.WETH_BASE);
    console.log(`✅ WETH Contract: ${ethers.formatEther(wethBalance)} ETH`);
    
    this.addHealthCheck("Liquidity Infrastructure", 
      allHealthy ? "HEALTHY" : "CRITICAL", 
      allHealthy ? "All V4 contracts deployed" : "Some V4 contracts missing");
  }

  private addHealthCheck(category: string, status: "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN", message: string, details?: any) {
    this.healthChecks.push({ category, status, message, details });
  }

  private generateHealthReport() {
    console.log("\n📊 ECOSYSTEM HEALTH REPORT");
    console.log("===========================");
    
    const healthy = this.healthChecks.filter(h => h.status === "HEALTHY").length;
    const warnings = this.healthChecks.filter(h => h.status === "WARNING").length;
    const critical = this.healthChecks.filter(h => h.status === "CRITICAL").length;
    const unknown = this.healthChecks.filter(h => h.status === "UNKNOWN").length;
    
    console.log(`📈 Health Summary:`);
    console.log(`   🟢 Healthy: ${healthy}`);
    console.log(`   🟡 Warnings: ${warnings}`);
    console.log(`   🔴 Critical: ${critical}`);
    console.log(`   ⚪ Unknown: ${unknown}`);
    
    // Overall status
    let overallStatus: string;
    let overallEmoji: string;
    
    if (critical > 0) {
      overallStatus = "CRITICAL ISSUES DETECTED";
      overallEmoji = "🔴";
    } else if (warnings > 0) {
      overallStatus = "WARNINGS DETECTED";
      overallEmoji = "🟡";
    } else {
      overallStatus = "ALL SYSTEMS HEALTHY";
      overallEmoji = "🟢";
    }
    
    console.log(`\n${overallEmoji} OVERALL STATUS: ${overallStatus}`);
    
    // Detail warnings and critical issues
    if (warnings > 0 || critical > 0) {
      console.log("\n⚠️ ISSUES DETECTED:");
      console.log("==================");
      
      this.healthChecks
        .filter(h => h.status === "WARNING" || h.status === "CRITICAL")
        .forEach(check => {
          const emoji = check.status === "CRITICAL" ? "🔴" : "🟡";
          console.log(`${emoji} ${check.category}: ${check.message}`);
        });
    }
    
    // Token distribution summary
    this.generateTokenDistributionSummary();
    
    // Recommendations
    this.generateRecommendations();
    
    console.log(`\n📅 Health check completed at: ${new Date().toISOString()}`);
  }

  private generateTokenDistributionSummary() {
    console.log("\n💰 TOKEN DISTRIBUTION SUMMARY");
    console.log("=============================");
    
    let totalDistributed = 0;
    
    this.contractStatuses.forEach(contract => {
      if (contract.tokenBalance && contract.tokenBalance !== "0.0") {
        const balance = parseFloat(contract.tokenBalance);
        totalDistributed += balance;
        console.log(`📍 ${contract.name}: ${contract.tokenBalance} ARCx`);
      }
    });
    
    console.log(`📊 Total Distributed: ${totalDistributed.toLocaleString()} ARCx`);
    console.log(`📊 Max Supply: 1,000,000 ARCx`);
    console.log(`📊 Distribution %: ${((totalDistributed / 1000000) * 100).toFixed(2)}%`);
  }

  private generateRecommendations() {
    console.log("\n💡 RECOMMENDATIONS");
    console.log("==================");
    
    const criticalIssues = this.healthChecks.filter(h => h.status === "CRITICAL");
    const warnings = this.healthChecks.filter(h => h.status === "WARNING");
    
    if (criticalIssues.length === 0 && warnings.length === 0) {
      console.log("🎉 No issues detected - system operating optimally!");
      return;
    }
    
    if (criticalIssues.length > 0) {
      console.log("🚨 IMMEDIATE ACTION REQUIRED:");
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. Fix ${issue.category}: ${issue.message}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log("\n⚠️ RECOMMENDED ACTIONS:");
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. Address ${warning.category}: ${warning.message}`);
      });
    }
    
    // General recommendations
    console.log("\n📋 GENERAL MAINTENANCE:");
    console.log("1. Monitor contract balances regularly");
    console.log("2. Ensure sufficient ETH in safes for gas fees");
    console.log("3. Verify all contract interactions are functioning");
    console.log("4. Keep documentation updated with any changes");
  }
}

async function main() {
  const healthMonitor = new ARCxHealthMonitor();
  await healthMonitor.runFullHealthCheck();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
