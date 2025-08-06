// scripts/check_funding_status.ts
// Check if contracts are properly funded and ready

import { ethers } from "hardhat";

async function main() {
    console.log("💰 FUNDING STATUS CHECK");
    console.log("========================");
    console.log("Time:", new Date().toISOString());
    
    // Contract addresses
    const TOKEN_ADDRESS = "0xD788D9ac56c754cb927771eBf058966bA8aB734D";
    const DUTCH_AUCTION_ADDRESS = "0xB66e928C556362c513BB999dF4a4Ed2e76A8ACA3";
    const SMART_AIRDROP_ADDRESS = "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195";
    
    try {
        // Connect to token contract
        const ARCxToken = await ethers.getContractFactory("ARCxToken");
        const token = ARCxToken.attach(TOKEN_ADDRESS);
        
        console.log("\n🪙 TOKEN BALANCE CHECK:");
        
        // Check Dutch Auction funding
        const auctionBalance = await token.balanceOf(DUTCH_AUCTION_ADDRESS);
        console.log(`Dutch Auction (${DUTCH_AUCTION_ADDRESS}):`);
        console.log(`  Balance: ${ethers.formatEther(auctionBalance)} ARCx`);
        console.log(`  Required: 100,000 ARCx`);
        console.log(`  Status: ${auctionBalance >= ethers.parseEther("100000") ? "✅ FUNDED" : "❌ NEEDS FUNDING"}`);
        
        // Check Smart Airdrop funding
        const airdropBalance = await token.balanceOf(SMART_AIRDROP_ADDRESS);
        console.log(`\nSmart Airdrop (${SMART_AIRDROP_ADDRESS}):`);
        console.log(`  Balance: ${ethers.formatEther(airdropBalance)} ARCx`);
        console.log(`  Required: 50,000 ARCx`);
        console.log(`  Status: ${airdropBalance >= ethers.parseEther("50000") ? "✅ FUNDED" : "❌ NEEDS FUNDING"}`);
        
        // Check if Dutch Auction is active
        console.log("\n⚡ DUTCH AUCTION STATUS:");
        try {
            const ARCxDutchAuction = await ethers.getContractFactory("ARCxDutchAuction");
            const auction = ARCxDutchAuction.attach(DUTCH_AUCTION_ADDRESS);
            
            const status = await auction.getAuctionStatus();
            console.log(`Current Price: ${ethers.formatEther(status._currentPrice)} ETH per ARCx`);
            console.log(`Tokens Sold: ${ethers.formatEther(status._tokensSold)} ARCx`);
            console.log(`Time Remaining: ${Number(status._timeRemaining)} seconds`);
            console.log(`Is Active: ${status._isActive ? "🟢 YES - AUCTION IS LIVE!" : "🔴 NO - NOT ACTIVE"}`);
            
            if (status._isActive) {
                console.log("\n🎉 SUCCESS! YOUR AUCTION IS LIVE AND RUNNING!");
            }
            
        } catch (auctionError) {
            console.log("⚠️ Could not get auction status");
        }
        
        // Check if Smart Airdrop is ready
        console.log("\n🎁 SMART AIRDROP STATUS:");
        try {
            const ARCxSmartAirdrop = await ethers.getContractFactory("ARCxSmartAirdrop");
            const airdrop = ARCxSmartAirdrop.attach(SMART_AIRDROP_ADDRESS);
            
            const totalTokens = await airdrop.totalTokens();
            const totalClaimed = await airdrop.totalClaimed();
            const claimDeadline = await airdrop.claimDeadline();
            
            console.log(`Total Tokens: ${ethers.formatEther(totalTokens)} ARCx`);
            console.log(`Claimed: ${ethers.formatEther(totalClaimed)} ARCx`);
            console.log(`Deadline: ${new Date(Number(claimDeadline) * 1000).toISOString()}`);
            console.log(`Status: ${airdropBalance >= ethers.parseEther("50000") ? "🟢 READY FOR CLAIMS" : "🔴 NEEDS FUNDING"}`);
            
        } catch (airdropError) {
            console.log("⚠️ Could not get airdrop status");
        }
        
        // Overall status
        console.log("\n📊 OVERALL STATUS:");
        const auctionFunded = auctionBalance >= ethers.parseEther("100000");
        const airdropFunded = airdropBalance >= ethers.parseEther("50000");
        
        if (auctionFunded && airdropFunded) {
            console.log("🎉 ALL SYSTEMS GO! FULLY FUNDED AND OPERATIONAL!");
        } else {
            console.log("⚠️ STILL NEEDS FUNDING:");
            if (!auctionFunded) console.log("  - Dutch Auction needs funding");
            if (!airdropFunded) console.log("  - Smart Airdrop needs funding");
        }
        
    } catch (error: any) {
        console.error("❌ ERROR:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
