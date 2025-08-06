import { ethers } from "hardhat";

async function main() {
    console.log("🚀 ARCx Quick Status Check - August 6, 2025");
    console.log("===========================================");
    
    // Contract addresses from README (LIVE)
    const addresses = {
        token: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
        airdrop: "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195", 
        vesting: "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B",
        treasury: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"
    };
    
    console.log("📍 Checking contracts on Base L2:");
    Object.entries(addresses).forEach(([name, addr]) => {
        console.log(`${name.padEnd(10)}: ${addr}`);
    });
    
    try {
        const provider = ethers.provider;
        const currentBlock = await provider.getBlockNumber();
        console.log(`\n📊 Current Block: ${currentBlock}`);
        
        // Check if contracts exist
        console.log("\n🔍 Contract Verification:");
        for (const [name, address] of Object.entries(addresses)) {
            const code = await provider.getCode(address);
            const exists = code !== "0x";
            console.log(`${name.padEnd(10)}: ${exists ? "✅ DEPLOYED" : "❌ NOT FOUND"}`);
        }
        
        // Check ETH balances
        console.log("\n💰 ETH Balances:");
        for (const [name, address] of Object.entries(addresses)) {
            const balance = await provider.getBalance(address);
            const ethBalance = ethers.formatEther(balance);
            console.log(`${name.padEnd(10)}: ${ethBalance} ETH`);
        }
        
        // Quick token info if possible
        console.log("\n🪙 Token Quick Check:");
        try {
            const tokenInterface = new ethers.Interface([
                "function name() view returns (string)",
                "function totalSupply() view returns (uint256)",
                "function balanceOf(address) view returns (uint256)"
            ]);
            
            const tokenContract = new ethers.Contract(addresses.token, tokenInterface, provider);
            
            const name = await tokenContract.name();
            const totalSupply = await tokenContract.totalSupply();
            const treasuryBalance = await tokenContract.balanceOf(addresses.treasury);
            
            console.log(`Name: ${name}`);
            console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ARCx`);
            console.log(`Treasury Tokens: ${ethers.formatEther(treasuryBalance)} ARCx`);
            
        } catch (e) {
            console.log("⚠️ Could not fetch token details:", e.message);
        }
        
    } catch (error) {
        console.error("❌ Connection Error:", error.message);
        console.log("\n💡 Possible issues:");
        console.log("- Network connectivity");
        console.log("- RPC endpoint issues"); 
        console.log("- API rate limits");
    }
}

main().catch(console.error);
