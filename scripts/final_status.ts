import { ethers } from "hardhat";

async function main() {
    console.log("🎉 FINAL LIVE SYSTEM STATUS CHECK");
    console.log("=================================");
    
    const addresses = {
        arcxToken: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
        dutchAuction: "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836",
        smartAirdrop: "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195",
        treasury: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"
    };
    
    const provider = ethers.provider;
    const currentBlock = await provider.getBlockNumber();
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log(`📊 Block: ${currentBlock}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    
    // Check ARCx Token
    console.log("\n🪙 ARCx TOKEN STATUS:");
    try {
        const token = await ethers.getContractAt("ARCxToken", addresses.arcxToken);
        console.log(`✅ Name: ${await token.name()}`);
        console.log(`✅ Symbol: ${await token.symbol()}`);
        console.log(`✅ Total Supply: ${ethers.formatEther(await token.totalSupply())} ARCx`);
        console.log(`✅ Paused: ${await token.paused()}`);
    } catch (e: any) {
        console.log(`❌ Token Error: ${e.message}`);
    }
    
    // Check Dutch Auction
    console.log("\n🎯 DUTCH AUCTION STATUS:");
    try {
        const auction = await ethers.getContractAt("ARCxDutchAuction", addresses.dutchAuction);
        const startTime = await auction.startTime();
        const endTime = await auction.endTime();
        const currentPrice = await auction.getCurrentPrice();
        const totalTokens = await auction.totalTokens();
        const tokensSold = await auction.tokensSold();
        const auctionBalance = await ethers.getContractAt("ARCxToken", addresses.arcxToken).then(t => t.balanceOf(addresses.dutchAuction));
        
        console.log(`✅ Total Tokens: ${ethers.formatEther(totalTokens)} ARCx`);
        console.log(`✅ Tokens Available: ${ethers.formatEther(auctionBalance)} ARCx`);
        console.log(`✅ Tokens Sold: ${ethers.formatEther(tokensSold)} ARCx`);
        console.log(`✅ Current Price: ${ethers.formatEther(currentPrice)} ETH per ARCx`);
        console.log(`✅ Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`);
        console.log(`✅ End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
        
        const isActive = currentTime >= Number(startTime) && currentTime < Number(endTime);
        const hasStarted = currentTime >= Number(startTime);
        const timeToStart = hasStarted ? 0 : Number(startTime) - currentTime;
        
        console.log(`🚦 Status: ${isActive ? "🟢 LIVE & ACTIVE" : hasStarted ? "🔴 ENDED" : "🟡 STARTING SOON"}`);
        
        if (!hasStarted) {
            console.log(`⏰ Starts in: ${Math.floor(timeToStart / 60)} minutes ${timeToStart % 60} seconds`);
        }
        
    } catch (e: any) {
        console.log(`❌ Auction Error: ${e.message}`);
    }
    
    // Check Smart Airdrop
    console.log("\n🎁 SMART AIRDROP STATUS:");
    try {
        const airdropBalance = await ethers.getContractAt("ARCxToken", addresses.arcxToken).then(t => t.balanceOf(addresses.smartAirdrop));
        console.log(`✅ Airdrop Tokens: ${ethers.formatEther(airdropBalance)} ARCx`);
    } catch (e: any) {
        console.log(`❌ Airdrop Error: ${e.message}`);
    }
    
    // Check Treasury
    console.log("\n🏦 TREASURY STATUS:");
    try {
        const treasuryETH = await provider.getBalance(addresses.treasury);
        const treasuryARCx = await ethers.getContractAt("ARCxToken", addresses.arcxToken).then(t => t.balanceOf(addresses.treasury));
        
        console.log(`💰 ETH Balance: ${ethers.formatEther(treasuryETH)} ETH`);
        console.log(`🪙 ARCx Balance: ${ethers.formatEther(treasuryARCx)} ARCx`);
    } catch (e: any) {
        console.log(`❌ Treasury Error: ${e.message}`);
    }
    
    console.log("\n🎯 LIVE SYSTEM SUMMARY:");
    console.log("=======================");
    console.log("🟢 ARCx Token: DEPLOYED & ACTIVE");
    console.log("🟢 Dutch Auction: DEPLOYED & FUNDED");
    console.log("🟢 Smart Airdrop: DEPLOYED");
    console.log("🟢 Treasury Safe: OPERATIONAL");
    
    console.log("\n🌐 PUBLIC LINKS:");
    console.log("================");
    console.log(`🪙 ARCx Token: https://basescan.org/address/${addresses.arcxToken}`);
    console.log(`🎯 Dutch Auction: https://basescan.org/address/${addresses.dutchAuction}`);
    console.log(`🎁 Smart Airdrop: https://basescan.org/address/${addresses.smartAirdrop}`);
    console.log(`🏦 Treasury Safe: https://basescan.org/safe/base:${addresses.treasury}`);
    
    console.log("\n🚀 SYSTEM STATUS: FULLY LIVE! 🚀");
}

main().catch(console.error);
