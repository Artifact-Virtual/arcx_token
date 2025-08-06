import { ethers } from "hardhat";

async function main() {
    console.log("🔧 ARCx Deep Status Analysis");
    console.log("============================");
    
    const tokenAddress = "0xD788D9ac56c754cb927771eBf058966bA8aB734D";
    const provider = ethers.provider;
    
    console.log(`📍 Token Contract: ${tokenAddress}`);
    console.log(`📊 Current Block: ${await provider.getBlockNumber()}`);
    
    // Check bytecode size
    const code = await provider.getCode(tokenAddress);
    console.log(`📝 Contract Bytecode Size: ${code.length} characters`);
    console.log(`✅ Contract Exists: ${code !== "0x"}`);
    
    // Try different function calls to see what works
    const minimalInterface = new ethers.Interface([
        "function paused() view returns (bool)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)"
    ]);
    
    const contract = new ethers.Contract(tokenAddress, minimalInterface, provider);
    
    console.log("\n🧪 Function Call Tests:");
    
    const functions = ['paused', 'name', 'symbol', 'decimals', 'totalSupply'];
    
    for (const func of functions) {
        try {
            const result = await contract[func]();
            console.log(`✅ ${func}(): ${result}`);
        } catch (e: any) {
            console.log(`❌ ${func}(): ${e.message}`);
        }
    }
    
    // Check if this is actually an auction contract
    console.log("\n🎯 Auction Contract Test:");
    try {
        const auctionInterface = new ethers.Interface([
            "function startTime() view returns (uint256)",
            "function endTime() view returns (uint256)",  
            "function tokensSold() view returns (uint256)",
            "function getCurrentPrice() view returns (uint256)"
        ]);
        
        const auctionContract = new ethers.Contract(tokenAddress, auctionInterface, provider);
        
        const startTime = await auctionContract.startTime();
        const endTime = await auctionContract.endTime();
        const tokensSold = await auctionContract.tokensSold();
        const currentPrice = await auctionContract.getCurrentPrice();
        
        console.log(`🚀 Start Time: ${new Date(Number(startTime) * 1000).toISOString()}`);
        console.log(`🏁 End Time: ${new Date(Number(endTime) * 1000).toISOString()}`);
        console.log(`💰 Tokens Sold: ${ethers.formatEther(tokensSold)} ARCx`);
        console.log(`💲 Current Price: ${ethers.formatEther(currentPrice)} ETH per ARCx`);
        
        const now = Math.floor(Date.now() / 1000);
        if (now < Number(startTime)) {
            console.log("📅 Status: AUCTION NOT STARTED YET");
        } else if (now >= Number(startTime) && now < Number(endTime)) {
            console.log("🔥 Status: AUCTION ACTIVE!");
        } else {
            console.log("📋 Status: AUCTION ENDED");
        }
        
    } catch (e: any) {
        console.log(`❌ Not auction contract or error: ${e.message}`);
    }
}

main().catch(console.error);
