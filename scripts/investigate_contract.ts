import { ethers } from "hardhat";

async function main() {
    console.log("🔍 COMPREHENSIVE CONTRACT ANALYSIS");
    console.log("==================================");
    
    const tokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
    const provider = ethers.provider;
    
    console.log(`📍 Contract Address: ${tokenAddress}`);
    console.log(`📊 Block: ${await provider.getBlockNumber()}`);
    
    // Test standard ERC20 functions
    console.log("\n🪙 ERC20 TOKEN FUNCTIONS:");
    const erc20Interface = new ethers.Interface([
        "function name() view returns (string)",
        "function symbol() view returns (string)", 
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function paused() view returns (bool)"
    ]);
    
    const erc20Contract = new ethers.Contract(tokenAddress, erc20Interface, provider);
    
    try {
        console.log(`✅ Name: ${await erc20Contract.name()}`);
        console.log(`✅ Symbol: ${await erc20Contract.symbol()}`);
        console.log(`✅ Decimals: ${await erc20Contract.decimals()}`);
        console.log(`✅ Total Supply: ${ethers.formatEther(await erc20Contract.totalSupply())} ARCx`);
        console.log(`✅ Paused: ${await erc20Contract.paused()}`);
    } catch (e: any) {
        console.log(`❌ ERC20 Error: ${e.message}`);
    }
    
    // Test Dutch Auction functions
    console.log("\n🎯 DUTCH AUCTION FUNCTIONS:");
    const auctionInterface = new ethers.Interface([
        "function totalTokens() view returns (uint256)",
        "function tokensSold() view returns (uint256)",
        "function currentPrice() view returns (uint256)",
        "function auctionActive() view returns (bool)",
        "function startTime() view returns (uint256)",
        "function endTime() view returns (uint256)",
        "function minimumPrice() view returns (uint256)",
        "function maximumPrice() view returns (uint256)"
    ]);
    
    const auctionContract = new ethers.Contract(tokenAddress, auctionInterface, provider);
    
    const auctionFunctions = [
        "totalTokens", "tokensSold", "currentPrice", "auctionActive", 
        "startTime", "endTime", "minimumPrice", "maximumPrice"
    ];
    
    for (const func of auctionFunctions) {
        try {
            const result = await auctionContract[func]();
            if (func.includes("Time")) {
                const date = new Date(Number(result) * 1000);
                console.log(`✅ ${func}(): ${result} (${date.toISOString()})`);
            } else if (func.includes("Price") || func.includes("Tokens")) {
                console.log(`✅ ${func}(): ${ethers.formatEther(result)} ${func.includes("Price") ? "ETH" : "ARCx"}`);
            } else {
                console.log(`✅ ${func}(): ${result}`);
            }
        } catch (e: any) {
            console.log(`❌ ${func}(): ${e.message.split("(")[0]}`);
        }
    }
    
    // Test other possible auction function names
    console.log("\n🔍 ALTERNATIVE AUCTION FUNCTIONS:");
    const altFunctions = [
        "totalSupply() view returns (uint256)",
        "auctionTokens() view returns (uint256)",
        "soldTokens() view returns (uint256)",
        "price() view returns (uint256)",
        "isActive() view returns (bool)",
        "active() view returns (bool)",
        "saleActive() view returns (bool)"
    ];
    
    for (const funcSig of altFunctions) {
        try {
            const funcName = funcSig.split("(")[0];
            const iface = new ethers.Interface([`function ${funcSig}`]);
            const contract = new ethers.Contract(tokenAddress, iface, provider);
            const result = await contract[funcName]();
            console.log(`✅ ${funcName}(): ${result}`);
        } catch (e: any) {
            console.log(`❌ ${funcSig.split("(")[0]}(): Not available`);
        }
    }
    
    // Check recent transactions to see activity
    console.log("\n📈 RECENT ACTIVITY CHECK:");
    try {
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = latestBlock - 1000; // Last ~1000 blocks
        
        const filter = {
            address: tokenAddress,
            fromBlock: fromBlock,
            toBlock: latestBlock
        };
        
        const logs = await provider.getLogs(filter);
        console.log(`📊 Recent Events (last 1000 blocks): ${logs.length}`);
        
        if (logs.length > 0) {
            console.log(`🔥 Contract is ACTIVE - ${logs.length} events found`);
        } else {
            console.log(`😴 Contract appears quiet - no recent events`);
        }
        
    } catch (e: any) {
        console.log(`⚠️ Activity check failed: ${e.message}`);
    }
    
    console.log("\n🎯 INVESTIGATION COMPLETE!");
}

main().catch(console.error);
