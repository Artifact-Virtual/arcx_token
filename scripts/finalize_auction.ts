import { ethers } from "hardhat";

async function main() {
    console.log("🎯 FINALIZING AUCTION SETUP");
    console.log("===========================");
    
    const addresses = {
        arcxToken: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
        dutchAuction: "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836",
        treasury: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"
    };
    
    const [signer] = await ethers.getSigners();
    console.log("Signer:", signer.address);
    
    // Get contracts
    const arcxToken = await ethers.getContractAt("ARCxToken", addresses.arcxToken);
    const dutchAuction = await ethers.getContractAt("ARCxDutchAuction", addresses.dutchAuction);
    
    // Check current token distribution
    console.log("\n💰 CURRENT TOKEN DISTRIBUTION:");
    const signerBalance = await arcxToken.balanceOf(signer.address);
    const treasuryBalance = await arcxToken.balanceOf(addresses.treasury);
    const auctionBalance = await arcxToken.balanceOf(addresses.dutchAuction);
    
    console.log(`Signer Balance: ${ethers.formatEther(signerBalance)} ARCx`);
    console.log(`Treasury Balance: ${ethers.formatEther(treasuryBalance)} ARCx`);
    console.log(`Auction Balance: ${ethers.formatEther(auctionBalance)} ARCx`);
    
    const tokensNeeded = ethers.parseEther("100000");
    
    if (auctionBalance < tokensNeeded) {
        console.log("\n🔄 TRANSFERRING TOKENS TO AUCTION...");
        
        // Transfer from signer to auction if signer has tokens
        if (signerBalance >= tokensNeeded) {
            const tx = await arcxToken.transfer(addresses.dutchAuction, tokensNeeded);
            await tx.wait();
            console.log(`✅ Transferred ${ethers.formatEther(tokensNeeded)} ARCx to auction`);
            console.log(`Transaction: ${tx.hash}`);
        } else {
            console.log("❌ Need to mint tokens first or transfer from treasury");
            
            // Try minting to auction directly
            try {
                console.log("🔨 Attempting to mint tokens to auction...");
                const mintTx = await arcxToken.mint(addresses.dutchAuction, tokensNeeded);
                await mintTx.wait();
                console.log(`✅ Minted ${ethers.formatEther(tokensNeeded)} ARCx to auction`);
                console.log(`Mint Transaction: ${mintTx.hash}`);
            } catch (e: any) {
                console.log(`❌ Minting failed: ${e.message}`);
            }
        }
    } else {
        console.log("✅ Auction already has sufficient tokens");
    }
    
    // Verify auction setup
    console.log("\n🎯 AUCTION STATUS:");
    const auctionBalanceAfter = await arcxToken.balanceOf(addresses.dutchAuction);
    const totalTokens = await dutchAuction.totalTokens();
    const currentPrice = await dutchAuction.getCurrentPrice();
    const startTime = await dutchAuction.startTime();
    const endTime = await dutchAuction.endTime();
    const tokensSold = await dutchAuction.tokensSold();
    
    console.log(`Auction Token Balance: ${ethers.formatEther(auctionBalanceAfter)} ARCx`);
    console.log(`Auction Total Tokens: ${ethers.formatEther(totalTokens)} ARCx`);
    console.log(`Current Price: ${ethers.formatEther(currentPrice)} ETH per ARCx`);
    console.log(`Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`);
    console.log(`End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
    console.log(`Tokens Sold: ${ethers.formatEther(tokensSold)} ARCx`);
    
    const isReady = auctionBalanceAfter >= totalTokens;
    const hasStarted = Number(startTime) <= Math.floor(Date.now() / 1000);
    const hasEnded = Number(endTime) <= Math.floor(Date.now() / 1000);
    
    console.log("\n🚦 AUCTION READINESS:");
    console.log(`Tokens Ready: ${isReady ? "✅" : "❌"}`);
    console.log(`Has Started: ${hasStarted ? "✅" : "❌"}`);
    console.log(`Has Ended: ${hasEnded ? "❌ (Good)" : "✅ (Active)"}`);
    
    if (isReady && hasStarted && !hasEnded) {
        console.log("\n🎉 AUCTION IS LIVE AND READY!");
        console.log("🔗 Users can now participate in the Dutch Auction!");
        
        // Test purchase function availability
        try {
            const purchaseData = dutchAuction.interface.encodeFunctionData("purchase", []);
            console.log("✅ Purchase function is available");
        } catch (e) {
            console.log("❌ Purchase function check failed");
        }
    } else {
        console.log("\n⚠️ Auction setup incomplete:");
        if (!isReady) console.log("- Need to transfer tokens to auction");
        if (!hasStarted) console.log(`- Auction starts in ${Math.ceil((Number(startTime) - Date.now()/1000)/60)} minutes`);
        if (hasEnded) console.log("- Auction has ended");
    }
    
    console.log("\n📋 FINAL ADDRESSES:");
    console.log("===================");
    console.log(`ARCx Token: ${addresses.arcxToken}`);
    console.log(`Dutch Auction: ${addresses.dutchAuction}`);
    console.log(`Treasury: ${addresses.treasury}`);
}

main().catch(console.error);
