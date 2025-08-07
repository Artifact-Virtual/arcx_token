// scripts/deploy.ts
// Consolidated deployment script replacing multiple deployment scripts
// Replaces: deploy_dutch_auction.ts, EMERGENCY_deploy_dutch_auction.ts, EMERGENCY_deploy_smart_airdrop.ts

import { ethers } from "hardhat";
import { CONTRACTS, AMOUNTS, TIME } from "./shared/constants";
import { displayScriptHeader, validateNetwork, checkEthBalance, printValidationResults } from "./shared/utils";

interface DeploymentOptions {
  component: "auction" | "airdrop" | "vesting" | "all";
  dryRun?: boolean;
  confirm?: boolean;
}

async function main() {
  displayScriptHeader(
    "ARCx Component Deployment",
    "Consolidated deployment for auction, airdrop, and vesting contracts"
  );

  // Parse command line arguments
  const args = process.argv.slice(2);
  const component = args[0] as DeploymentOptions["component"] || "all";
  const dryRun = args.includes("--dry-run");
  const confirm = args.includes("--confirm");

  console.log(`\n🎯 Deployment Mode: ${component.toUpperCase()}`);
  console.log(`🧪 Dry Run: ${dryRun ? "ENABLED" : "DISABLED"}`);
  console.log(`✅ Auto Confirm: ${confirm ? "ENABLED" : "DISABLED"}`);

  // Validation
  const validationResults = [];
  
  // Network validation
  validationResults.push(await validateNetwork());
  
  // Signer validation
  const [deployer] = await ethers.getSigners();
  console.log(`\n🔐 Deployer: ${deployer.address}`);
  
  validationResults.push(await checkEthBalance(deployer.address, "0.1"));
  
  const { criticalIssues } = printValidationResults(validationResults);
  
  if (criticalIssues > 0 && !dryRun) {
    console.log("❌ Cannot proceed with critical issues. Use --dry-run to test.");
    return;
  }

  // Deploy components based on selection
  if (component === "auction" || component === "all") {
    await deployDutchAuction(dryRun);
  }
  
  if (component === "airdrop" || component === "all") {
    await deploySmartAirdrop(dryRun);
  }
  
  if (component === "vesting" || component === "all") {
    await deployVesting(dryRun);
  }

  console.log("\n🎉 DEPLOYMENT COMPLETE");
  console.log("======================");
}

async function deployDutchAuction(dryRun: boolean) {
  console.log("\n🎯 DUTCH AUCTION DEPLOYMENT");
  console.log("===========================");
  
  const auctionParams = {
    totalTokens: ethers.parseEther(AMOUNTS.AUCTION_TOKENS),
    startPrice: ethers.parseEther("0.0008"),  // 0.0008 ETH per ARCx
    reservePrice: ethers.parseEther("0.0002"), // 0.0002 ETH per ARCx  
    auctionDuration: 72 * TIME.HOUR, // 72 hours
    maxPurchasePerAddress: ethers.parseEther("10000"), // 10k ARCx max
    treasury: CONTRACTS.TREASURY_SAFE,
    startTime: Math.floor(Date.now() / 1000) + 300, // Start in 5 minutes
  };
  
  console.log("📋 Auction Configuration:");
  console.log(`- Total Tokens: ${ethers.formatEther(auctionParams.totalTokens)} ARCx`);
  console.log(`- Start Price: ${ethers.formatEther(auctionParams.startPrice)} ETH/ARCx`);
  console.log(`- Reserve Price: ${ethers.formatEther(auctionParams.reservePrice)} ETH/ARCx`);
  console.log(`- Duration: ${auctionParams.auctionDuration / TIME.HOUR} hours`);
  console.log(`- Treasury: ${auctionParams.treasury}`);
  console.log(`- Start Time: ${new Date(auctionParams.startTime * 1000).toISOString()}`);
  
  if (dryRun) {
    console.log("🧪 DRY RUN: Would deploy Dutch Auction with above parameters");
    return;
  }
  
  try {
    console.log("\n🚀 Deploying ARCxDutchAuction...");
    
    const ARCxDutchAuction = await ethers.getContractFactory("ARCxDutchAuction");
    
    const auction = await ARCxDutchAuction.deploy(
      CONTRACTS.ARCX_TOKEN,
      auctionParams.totalTokens,
      auctionParams.startTime,
      auctionParams.auctionDuration,
      auctionParams.startPrice,
      auctionParams.reservePrice,
      auctionParams.treasury,
      auctionParams.maxPurchasePerAddress
    );
    
    await auction.waitForDeployment();
    const auctionAddress = await auction.getAddress();
    
    console.log("✅ Dutch Auction deployed successfully!");
    console.log("Contract Address:", auctionAddress);
    
    // Verification
    console.log("\n🔍 Verifying deployment:");
    console.log("Token Address:", await auction.arcxToken());
    console.log("Total Tokens:", ethers.formatEther(await auction.totalTokens()));
    
    console.log("\n📋 NEXT STEPS:");
    console.log(`1. Transfer ${AMOUNTS.AUCTION_TOKENS} ARCx tokens to: ${auctionAddress}`);
    console.log("2. Update documentation with auction address");
    console.log("3. Update website with correct auction link");
    
  } catch (error: any) {
    console.log(`❌ Dutch Auction deployment failed: ${error.message}`);
  }
}

async function deploySmartAirdrop(dryRun: boolean) {
  console.log("\n🎁 SMART AIRDROP DEPLOYMENT");
  console.log("===========================");
  
  const airdropParams = {
    totalTokens: ethers.parseEther(AMOUNTS.AIRDROP_TOKENS),
    claimDuration: 30 * TIME.DAY, // 30 days
    minimumAccountAge: 100000, // Block number for anti-sybil
    merkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000001", // Temporary
  };
  
  console.log("📋 Airdrop Configuration:");
  console.log(`- Total Tokens: ${ethers.formatEther(airdropParams.totalTokens)} ARCx`);
  console.log(`- Claim Duration: ${airdropParams.claimDuration / TIME.DAY} days`);
  console.log(`- Min Account Age: ${airdropParams.minimumAccountAge} blocks`);
  console.log(`- Merkle Root: ${airdropParams.merkleRoot} (temporary)`);
  
  if (dryRun) {
    console.log("🧪 DRY RUN: Would deploy Smart Airdrop with above parameters");
    return;
  }
  
  try {
    console.log("\n🚀 Deploying ARCxSmartAirdrop...");
    
    const ARCxSmartAirdrop = await ethers.getContractFactory("ARCxSmartAirdrop");
    
    const airdrop = await ARCxSmartAirdrop.deploy(
      CONTRACTS.ARCX_TOKEN,
      airdropParams.totalTokens,
      airdropParams.claimDuration,
      airdropParams.merkleRoot,
      airdropParams.minimumAccountAge
    );
    
    await airdrop.waitForDeployment();
    const airdropAddress = await airdrop.getAddress();
    
    console.log("✅ Smart Airdrop deployed successfully!");
    console.log("Contract Address:", airdropAddress);
    
    // Verification
    console.log("\n🔍 Verifying deployment:");
    console.log("Total Tokens:", ethers.formatEther(await airdrop.totalTokens()));
    console.log("Claim Deadline:", new Date(Number(await airdrop.claimDeadline()) * 1000).toISOString());
    
    console.log("\n📋 NEXT STEPS:");
    console.log(`1. Transfer ${AMOUNTS.AIRDROP_TOKENS} ARCx tokens to: ${airdropAddress}`);
    console.log("2. Update merkle root with real eligibility data");
    console.log("3. Verify contract on BaseScan");
    
  } catch (error: any) {
    console.log(`❌ Smart Airdrop deployment failed: ${error.message}`);
  }
}

async function deployVesting(dryRun: boolean) {
  console.log("\n📅 VESTING CONTRACT DEPLOYMENT");
  console.log("==============================");
  
  const vestingParams = {
    tokenAddress: CONTRACTS.ARCX_TOKEN,
    admin: CONTRACTS.TREASURY_SAFE,
    vestingStart: Math.floor(new Date("2025-08-15").getTime() / 1000),
  };
  
  console.log("📋 Vesting Configuration:");
  console.log(`- Token Address: ${vestingParams.tokenAddress}`);
  console.log(`- Admin Address: ${vestingParams.admin}`);
  console.log(`- Vesting Start: ${new Date(vestingParams.vestingStart * 1000).toISOString()}`);
  
  if (dryRun) {
    console.log("🧪 DRY RUN: Would deploy Vesting Contract with above parameters");
    return;
  }
  
  try {
    console.log("\n🚀 Deploying ARCxMasterVesting...");
    
    const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
    
    const vesting = await ARCxMasterVesting.deploy(
      vestingParams.tokenAddress,
      vestingParams.admin,
      vestingParams.vestingStart
    );
    
    await vesting.waitForDeployment();
    const vestingAddress = await vesting.getAddress();
    
    console.log("✅ Master Vesting deployed successfully!");
    console.log("Contract Address:", vestingAddress);
    
    // Verification
    console.log("\n🔍 Verifying deployment:");
    console.log("Token Address:", await vesting.token());
    console.log("Vesting Start:", new Date(Number(await vesting.globalVestingStart()) * 1000).toISOString());
    
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Transfer vesting tokens to contract");
    console.log("2. Setup vesting schedules");
    console.log("3. Configure category allocations");
    
  } catch (error: any) {
    console.log(`❌ Vesting deployment failed: ${error.message}`);
  }
}

// Usage examples in comments:
// npx hardhat run scripts/deploy.ts --network base auction
// npx hardhat run scripts/deploy.ts --network base airdrop --dry-run
// npx hardhat run scripts/deploy.ts --network base all --confirm

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
