// scripts/deploy_smart_airdrop.ts
// Smart Airdrop Contract Deployment

import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("SMART AIRDROP DEPLOYMENT");
    console.log("============================");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
    
    // Configuration
    const ARCX_TOKEN_ADDRESS = process.env.ARCX_TOKEN_ADDRESS || "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
    
    // Airdrop parameters - LIVE PARAMETERS
    const AIRDROP_TOKENS = ethers.parseEther("50000"); // 50K ARCx
    const CLAIM_DURATION = 30 * 24 * 3600; // 30 days
    const MINIMUM_ACCOUNT_AGE = 100000; // Block number for anti-sybil
    
    // Temporary merkle root - will be updated with real data
    const MERKLE_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000001";
    
    console.log("\n🎯 AIRDROP PARAMETERS:");
    console.log("ARCx Token:", ARCX_TOKEN_ADDRESS);
    console.log("Total Tokens:", ethers.formatEther(AIRDROP_TOKENS));
    console.log("Claim Duration:", CLAIM_DURATION / (24 * 3600), "days");
    console.log("Min Account Age:", MINIMUM_ACCOUNT_AGE, "blocks");
    console.log("Merkle Root:", MERKLE_ROOT, "(temporary)");
    
    // Deploy Smart Airdrop
    console.log("\n⚡ DEPLOYING SMART AIRDROP...");
    const ARCxSmartAirdrop = await ethers.getContractFactory("ARCxSmartAirdrop");
    const airdrop = await ARCxSmartAirdrop.deploy(
        ARCX_TOKEN_ADDRESS,
        AIRDROP_TOKENS,
        CLAIM_DURATION,
        MERKLE_ROOT,
        MINIMUM_ACCOUNT_AGE
    );
    
    await airdrop.waitForDeployment();
    const airdropAddress = await airdrop.getAddress();
    
    console.log("\n✅ SMART AIRDROP DEPLOYED!");
    console.log("Contract Address:", airdropAddress);
    
    // Verify deployment
    console.log("\n🔍 VERIFYING DEPLOYMENT:");
    console.log("Total Tokens:", ethers.formatEther(await airdrop.totalTokens()));
    console.log("Claim Deadline:", new Date(Number(await airdrop.claimDeadline()) * 1000).toISOString());
    console.log("Merkle Root:", await airdrop.merkleRoot());
    
    console.log("\n🚨 NEXT STEPS:");
    console.log("1. TRANSFER 50,000 ARCx TO AIRDROP CONTRACT:");
    console.log(`   To: ${airdropAddress}`);
    console.log(`   Amount: 50000000000000000000000 (50K ARCx)`);
    console.log("2. UPDATE MERKLE ROOT with real eligibility data");
    console.log("3. Verify on BaseScan");
    
    // Output deployment info for records
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        airdropAddress: airdropAddress,
        tokenAddress: ARCX_TOKEN_ADDRESS,
        claimDuration: CLAIM_DURATION,
        deployedAt: new Date().toISOString(),
        transactionHash: airdrop.deploymentTransaction()?.hash,
    };
    
    console.log("\n📋 DEPLOYMENT RECORD:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
    .then(() => {
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("⏰ AIRDROP IS READY FOR MERKLE ROOT UPDATE!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    });
