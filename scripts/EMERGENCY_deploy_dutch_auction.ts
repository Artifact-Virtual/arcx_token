// scripts/deploy_dutch_auction.ts
// Dutch Auction Contract Deployment

import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("DUTCH AUCTION DEPLOYMENT");
    console.log("============================");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
    
    // Configuration
    const ARCX_TOKEN_ADDRESS = process.env.ARCX_TOKEN_ADDRESS || "0xD788D9ac56c754cb927771eBf058966bA8aB734D";
    const TREASURY_ADDRESS = process.env.TREASURY_SAFE_ADDRESS || "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38";
    
    // Auction parameters - LIVE PARAMETERS
    const AUCTION_TOKENS = ethers.parseEther("100000"); // 100K ARCx
    const START_PRICE = ethers.parseEther("0.0005"); // 0.0005 ETH per ARCx ($1.25 at $2500 ETH)
    const RESERVE_PRICE = ethers.parseEther("0.0001"); // 0.0001 ETH per ARCx ($0.25 at $2500 ETH)
    const AUCTION_DURATION = 72 * 3600; // 72 hours
    const MAX_PURCHASE = ethers.parseEther("5000"); // 5K ARCx max per address
    
    // Start time - IMMEDIATE (in 5 minutes to allow for deployment)
    const START_TIME = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
    
    console.log("\n🎯 AUCTION PARAMETERS:");
    console.log("ARCx Token:", ARCX_TOKEN_ADDRESS);
    console.log("Treasury:", TREASURY_ADDRESS);
    console.log("Total Tokens:", ethers.formatEther(AUCTION_TOKENS));
    console.log("Start Price:", ethers.formatEther(START_PRICE), "ETH per ARCx");
    console.log("Reserve Price:", ethers.formatEther(RESERVE_PRICE), "ETH per ARCx");
    console.log("Duration:", AUCTION_DURATION / 3600, "hours");
    console.log("Max Purchase:", ethers.formatEther(MAX_PURCHASE), "ARCx");
    console.log("Start Time:", new Date(START_TIME * 1000).toISOString());
    
    // Deploy Dutch Auction
    console.log("\n⚡ DEPLOYING DUTCH AUCTION...");
    const ARCxDutchAuction = await ethers.getContractFactory("ARCxDutchAuction");
    const auction = await ARCxDutchAuction.deploy(
        ARCX_TOKEN_ADDRESS,
        AUCTION_TOKENS,
        START_TIME,
        AUCTION_DURATION,
        START_PRICE,
        RESERVE_PRICE,
        TREASURY_ADDRESS,
        MAX_PURCHASE
    );
    
    await auction.waitForDeployment();
    const auctionAddress = await auction.getAddress();
    
    console.log("\n✅ DUTCH AUCTION DEPLOYED!");
    console.log("Contract Address:", auctionAddress);
    
    // Verify deployment
    console.log("\n🔍 VERIFYING DEPLOYMENT:");
    console.log("Total Tokens:", ethers.formatEther(await auction.totalTokens()));
    console.log("Start Time:", new Date(Number(await auction.startTime()) * 1000).toISOString());
    console.log("Treasury:", await auction.treasury());
    
    console.log("\n🚨 NEXT STEPS:");
    console.log("1. TRANSFER 100,000 ARCx TO AUCTION CONTRACT:");
    console.log(`   To: ${auctionAddress}`);
    console.log(`   Amount: 100000000000000000000000 (100K ARCx)`);
    console.log("2. Contract is ready to go live!");
    console.log("3. Verify on BaseScan");
    
    // Output deployment info for records
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        auctionAddress: auctionAddress,
        tokenAddress: ARCX_TOKEN_ADDRESS,
        treasury: TREASURY_ADDRESS,
        startTime: START_TIME,
        deployedAt: new Date().toISOString(),
        transactionHash: auction.deploymentTransaction()?.hash,
    };
    
    console.log("\n📋 DEPLOYMENT RECORD:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
    .then(() => {
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("⏰ AUCTION IS READY TO START!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    });
