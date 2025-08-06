import { ethers } from "hardhat";

async function main() {
    console.log("🎯 DEPLOYING MISSING DUTCH AUCTION CONTRACT");
    console.log("===========================================");
    
    const arcxTokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
    const [deployer] = await ethers.getSigners();
    
    console.log("Deployer:", deployer.address);
    console.log("ARCx Token:", arcxTokenAddress);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Auction parameters
    const auctionParams = {
        totalTokens: ethers.parseEther("100000"), // 100,000 ARCx
        startPrice: ethers.parseEther("0.0008"),  // 0.0008 ETH per ARCx
        reservePrice: ethers.parseEther("0.0002"), // 0.0002 ETH per ARCx  
        auctionDuration: 72 * 60 * 60, // 72 hours
        maxPurchasePerAddress: ethers.parseEther("10000"), // 10k ARCx max
        tierOneLimit: ethers.parseEther("1000"), // Small buyer limit
        tierTwoLimit: ethers.parseEther("5000"), // Medium buyer limit
        treasury: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"
    };
    
    console.log("\n📋 Auction Configuration:");
    console.log(`Total Tokens: ${ethers.formatEther(auctionParams.totalTokens)} ARCx`);
    console.log(`Start Price: ${ethers.formatEther(auctionParams.startPrice)} ETH/ARCx`);
    console.log(`Reserve Price: ${ethers.formatEther(auctionParams.reservePrice)} ETH/ARCx`);
    console.log(`Duration: ${auctionParams.auctionDuration / 3600} hours`);
    console.log(`Treasury: ${auctionParams.treasury}`);
    
    // Deploy Dutch Auction
    console.log("\n🚀 Deploying ARCxDutchAuction...");
    
    const ARCxDutchAuction = await ethers.getContractFactory("ARCxDutchAuction");
    
    const startTime = Math.floor(Date.now() / 1000) + 300; // Start in 5 minutes
    
    const auction = await ARCxDutchAuction.deploy(
        arcxTokenAddress,
        auctionParams.totalTokens,
        startTime,
        auctionParams.auctionDuration,
        auctionParams.startPrice,
        auctionParams.reservePrice,
        auctionParams.treasury,
        auctionParams.maxPurchasePerAddress
    );
    
    await auction.waitForDeployment();
    const auctionAddress = await auction.getAddress();
    
    console.log("\n✅ ARCxDutchAuction deployed successfully!");
    console.log("Auction Address:", auctionAddress);
    
    // Verify deployment
    console.log("\n🔍 Verifying deployment:");
    console.log("Token Address:", await auction.arcxToken());
    console.log("Total Tokens:", ethers.formatEther(await auction.totalTokens()));
    console.log("Start Time:", new Date(Number(await auction.startTime()) * 1000).toISOString());
    console.log("End Time:", new Date(Number(await auction.endTime()) * 1000).toISOString());
    
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Transfer 100,000 ARCx tokens to auction contract:");
    console.log(`   Address: ${auctionAddress}`);
    console.log("2. Update documentation with auction address");
    console.log("3. Update website with correct auction link");
    console.log("4. Start the auction!");
    
    console.log("\n📄 DEPLOYMENT SUMMARY:");
    console.log("===============================");
    console.log(`ARCx Token: ${arcxTokenAddress}`);
    console.log(`Dutch Auction: ${auctionAddress}`);
    console.log(`Treasury: ${auctionParams.treasury}`);
}

main().catch(console.error);
