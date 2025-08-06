// scripts/check_auction_status.ts
// Check Dutch Auction Contract Status

import { ethers } from "hardhat";

async function main() {
    console.log("🔍 DUTCH AUCTION STATUS CHECK");
    console.log("==============================");
    
    // Your deployed auction address
    const AUCTION_ADDRESS = "0xB66e928C556362c513BB999dF4a4Ed2e76A8ACA3";
    const TOKEN_ADDRESS = "0xD788D9ac56c754cb927771eBf058966bA8aB734D";
    
    console.log("Auction Contract:", AUCTION_ADDRESS);
    console.log("Token Contract:", TOKEN_ADDRESS);
    
    try {
        // Connect to contracts
        const ARCxToken = await ethers.getContractFactory("ARCxToken");
        const token = ARCxToken.attach(TOKEN_ADDRESS);
        
        const ARCxDutchAuction = await ethers.getContractFactory("ARCxDutchAuction");
        const auction = ARCxDutchAuction.attach(AUCTION_ADDRESS);
        
        console.log("\n🪙 TOKEN BALANCE CHECK:");
        const auctionBalance = await token.balanceOf(AUCTION_ADDRESS);
        console.log("Auction Contract Balance:", ethers.formatEther(auctionBalance), "ARCx");
        
        console.log("\n⏰ AUCTION STATUS:");
        const status = await auction.getAuctionStatus();
        console.log("Current Price:", ethers.formatEther(status._currentPrice), "ETH per ARCx");
        console.log("Tokens Sold:", ethers.formatEther(status._tokensSold), "ARCx");
        console.log("Tokens Remaining:", ethers.formatEther(status._tokensRemaining), "ARCx");
        console.log("Total Raised:", ethers.formatEther(status._totalRaised), "ETH");
        console.log("Time Remaining:", Number(status._timeRemaining), "seconds");
        console.log("Is Active:", status._isActive);
        
        console.log("\n📋 AUCTION PARAMETERS:");
        console.log("Total Tokens:", ethers.formatEther(await auction.totalTokens()));
        console.log("Start Time:", new Date(Number(await auction.startTime()) * 1000).toISOString());
        console.log("End Time:", new Date(Number(await auction.endTime()) * 1000).toISOString());
        console.log("Start Price:", ethers.formatEther(await auction.startPrice()), "ETH");
        console.log("Reserve Price:", ethers.formatEther(await auction.reservePrice()), "ETH");
        console.log("Treasury:", await auction.treasury());
        console.log("Finalized:", await auction.finalized());
        
        // Check if auction is ready
        const currentTime = Math.floor(Date.now() / 1000);
        const startTime = Number(await auction.startTime());
        const endTime = Number(await auction.endTime());
        
        console.log("\n🚨 AUCTION STATUS SUMMARY:");
        if (currentTime < startTime) {
            console.log("⏳ AUCTION NOT YET STARTED");
            console.log("Starts in:", startTime - currentTime, "seconds");
        } else if (currentTime >= startTime && currentTime < endTime) {
            console.log("🟢 AUCTION IS LIVE AND ACTIVE!");
        } else {
            console.log("🔴 AUCTION HAS ENDED");
        }
        
        if (auctionBalance < ethers.parseEther("100000")) {
            console.log("⚠️  NEEDS TOKEN FUNDING - Current balance too low");
        } else {
            console.log("✅ AUCTION IS PROPERLY FUNDED");
        }
        
    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
