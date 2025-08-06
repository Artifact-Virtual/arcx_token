import { ethers } from "hardhat";

async function checkAuctionStatus() {
    console.log("🎯 ARCx Dutch Auction Status Check");
    console.log("==================================");
    
    const auctionAddress = "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836";
    const tokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
    
    // Get contracts
    const auction = await ethers.getContractAt("ARCxDutchAuction", auctionAddress);
    const token = await ethers.getContractAt("ARCxToken", tokenAddress);
    
    try {
        // Check auction state using the correct function
        const auctionStatus = await auction.getAuctionStatus();
        const currentTime = Math.floor(Date.now() / 1000);
        const startTime = await auction.startTime();
        const endTime = await auction.endTime();
        const startPrice = await auction.startPrice();
        const reservePrice = await auction.reservePrice();
        const totalTokens = await auction.totalTokens();
        
        console.log("📅 Timing:");
        console.log(`Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`);
        console.log(`End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
        console.log(`Current Time: ${new Date(currentTime * 1000).toISOString()}`);
        console.log(`Is Active: ${auctionStatus._isActive}`);
        console.log(`Time Remaining: ${auctionStatus._timeRemaining} seconds`);
        
        // Check auction parameters
        console.log("\n💰 Auction Parameters:");
        console.log(`Start Price: ${ethers.formatEther(startPrice)} ETH per token`);
        console.log(`Reserve Price: ${ethers.formatEther(reservePrice)} ETH per token`);
        console.log(`Total Tokens: ${ethers.formatUnits(totalTokens, 18)} ARCx`);
        console.log(`Tokens Sold: ${ethers.formatUnits(auctionStatus._tokensSold, 18)} ARCx`);
        console.log(`Tokens Remaining: ${ethers.formatUnits(auctionStatus._tokensRemaining, 18)} ARCx`);
        console.log(`Current Price: ${ethers.formatEther(auctionStatus._currentPrice)} ETH per token`);
        console.log(`Total ETH Raised: ${ethers.formatEther(auctionStatus._totalRaised)} ETH`);
        
        if (!auctionStatus._isActive) {
            console.log("🔴 Auction is NOT ACTIVE");
            
            if (Number(auctionStatus._timeRemaining) === 0) {
                console.log("⏰ Auction has ENDED due to time expiration");
            }
            
            // Check if finalized
            const finalized = await auction.finalized();
            console.log(`Finalized: ${finalized}`);
            
        } else {
            console.log("🟢 Auction is ACTIVE!");
            console.log(`⏱️ Time remaining: ${Math.floor(Number(auctionStatus._timeRemaining) / 3600)} hours, ${Math.floor((Number(auctionStatus._timeRemaining) % 3600) / 60)} minutes`);
        }
        
        // Check auction contract balance
        const provider = ethers.provider;
        const auctionEthBalance = await provider.getBalance(auctionAddress);
        const auctionTokenBalance = await token.balanceOf(auctionAddress);
        
        console.log("\n📊 Auction Contract Balances:");
        console.log(`ETH Balance: ${ethers.formatEther(auctionEthBalance)} ETH`);
        console.log(`Token Balance: ${ethers.formatUnits(auctionTokenBalance, 18)} ARCx`);
        
        // Check if funds can be withdrawn
        if (!auctionStatus._isActive) {
            console.log("\n✅ Auction has ended - funds can be withdrawn");
            
            // Check who can withdraw
            try {
                const owner = await auction.owner();
                console.log(`Owner: ${owner}`);
            } catch (e) {
                console.log("Could not get owner info");
            }
            
            try {
                // Check total raised
                const totalRaised = auctionEthBalance;
                console.log(`Contract ETH Balance: ${ethers.formatEther(totalRaised)} ETH`);
                
                // Check remaining tokens
                const remainingTokens = auctionStatus._tokensRemaining;
                console.log(`Remaining Tokens: ${ethers.formatUnits(remainingTokens, 18)} ARCx`);
                
            } catch (e) {
                console.log("Could not fetch withdrawal details");
            }
        }
        
    } catch (error: any) {
        console.error("❌ Error checking auction status:", error.message || error);
        
        // Try basic contract check
        try {
            const code = await ethers.provider.getCode(auctionAddress);
            if (code === "0x") {
                console.log("❌ Dutch Auction contract not deployed at this address");
            } else {
                console.log("✅ Contract exists but may have different interface");
            }
        } catch (e) {
            console.log("❌ Cannot connect to auction contract");
        }
    }
}

checkAuctionStatus().catch(console.error);
