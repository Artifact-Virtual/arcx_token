import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Pre-Liquidity Setup Verification");
    console.log("===================================");
    
    const addresses = {
        treasury: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
        arcxToken: "0xD788D9ac56c754cb927771eBf058966bA8aB734D", // Live auction contract
    };
    
    const provider = ethers.provider;
    const currentBlock = await provider.getBlockNumber();
    
    console.log(`📊 Current Block: ${currentBlock}`);
    console.log(`📅 Date: ${new Date().toISOString()}`);
    
    // Check treasury ETH balance
    console.log("\n💰 Treasury Wallet Status:");
    const treasuryETH = await provider.getBalance(addresses.treasury);
    console.log(`ETH Balance: ${ethers.formatEther(treasuryETH)} ETH`);
    
    const ethNeeded = ethers.parseEther("12.5");
    const hasEnoughETH = treasuryETH >= ethNeeded;
    console.log(`ETH Required: 12.5 ETH`);
    console.log(`ETH Status: ${hasEnoughETH ? "✅ SUFFICIENT" : "❌ INSUFFICIENT"}`);
    
    if (!hasEnoughETH) {
        const ethShortfall = ethers.formatEther(ethNeeded - treasuryETH);
        console.log(`🚨 Need to add: ${ethShortfall} ETH to treasury`);
    }
    
    // Try to check if auction contract has tokens to distribute
    console.log("\n🎯 Token Analysis:");
    try {
        // Check if this is an auction contract with tokens
        const auctionInterface = new ethers.Interface([
            "function totalTokens() view returns (uint256)",
            "function tokensSold() view returns (uint256)",
            "function arcxToken() view returns (address)"
        ]);
        
        const auctionContract = new ethers.Contract(addresses.arcxToken, auctionInterface, provider);
        
        const totalTokens = await auctionContract.totalTokens();
        const tokensSold = await auctionContract.tokensSold(); 
        const tokenAddress = await auctionContract.arcxToken();
        
        console.log(`Total Auction Tokens: ${ethers.formatEther(totalTokens)} ARCx`);
        console.log(`Tokens Sold: ${ethers.formatEther(tokensSold)} ARCx`);
        console.log(`Underlying Token: ${tokenAddress}`);
        
        // Check if treasury has tokens from the underlying token contract
        if (tokenAddress && tokenAddress !== ethers.ZeroAddress) {
            const tokenInterface = new ethers.Interface([
                "function balanceOf(address) view returns (uint256)",
                "function totalSupply() view returns (uint256)"
            ]);
            
            const tokenContract = new ethers.Contract(tokenAddress, tokenInterface, provider);
            const treasuryTokenBalance = await tokenContract.balanceOf(addresses.treasury);
            const totalSupply = await tokenContract.totalSupply();
            
            console.log(`\n🪙 Underlying Token (${tokenAddress}):`);
            console.log(`Treasury Balance: ${ethers.formatEther(treasuryTokenBalance)} ARCx`);
            console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ARCx`);
            
            const tokensNeeded = ethers.parseEther("25000");
            const hasEnoughTokens = treasuryTokenBalance >= tokensNeeded;
            console.log(`Tokens Required: 25,000 ARCx`);
            console.log(`Token Status: ${hasEnoughTokens ? "✅ SUFFICIENT" : "❌ INSUFFICIENT"}`);
            
            if (!hasEnoughTokens) {
                const tokenShortfall = ethers.formatEther(tokensNeeded - treasuryTokenBalance);
                console.log(`🚨 Need to add: ${tokenShortfall} ARCx to treasury`);
            }
        }
        
    } catch (e: any) {
        console.log(`⚠️ Could not analyze auction contract: ${e.message}`);
    }
    
    console.log("\n📋 NEXT STEPS SUMMARY:");
    console.log("1. Fund treasury with ETH if needed");
    console.log("2. Transfer ARCx tokens to treasury if needed");  
    console.log("3. Follow LIQUIDITY_SETUP_STEPS.md exactly");
    console.log("4. Execute Safe transactions in order");
    console.log("\n🎯 Ready for liquidity setup once treasury is funded!");
}

main().catch(console.error);
