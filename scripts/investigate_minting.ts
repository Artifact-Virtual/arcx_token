import { ethers } from "hardhat";

async function main() {
    console.log("🔍 INVESTIGATING MINTING ISSUE");
    console.log("===============================");
    
    const tokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
    const token = await ethers.getContractAt("ARCxToken", tokenAddress);
    
    console.log("📊 TOKEN SUPPLY ANALYSIS:");
    const totalSupply = await token.totalSupply();
    const maxSupply = await token.MAX_SUPPLY();
    
    console.log(`Current Supply: ${ethers.formatEther(totalSupply)} ARCx`);
    console.log(`Max Supply: ${ethers.formatEther(maxSupply)} ARCx`);
    console.log(`Over Limit: ${totalSupply > maxSupply ? "❌ YES!" : "✅ No"}`);
    
    // Check recent mint events
    console.log("\n🔍 RECENT MINT EVENTS:");
    const currentBlock = await ethers.provider.getBlockNumber();
    const fromBlock = currentBlock - 1000;
    
    const mintFilter = token.filters.Transfer(ethers.ZeroAddress);
    const mintEvents = await token.queryFilter(mintFilter, fromBlock);
    
    console.log(`Found ${mintEvents.length} mint events in last 1000 blocks:`);
    
    for (const event of mintEvents) {
        const args = event.args;
        console.log(`Block ${event.blockNumber}: Minted ${ethers.formatEther(args[2])} ARCx to ${args[1]}`);
    }
    
    // Check all balances
    console.log("\n💰 CURRENT DISTRIBUTION:");
    const addresses = {
        treasury: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
        auction: "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836",
        airdrop: "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195",
        deployer: "0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B"
    };
    
    let totalDistributed = 0n;
    for (const [name, address] of Object.entries(addresses)) {
        const balance = await token.balanceOf(address);
        totalDistributed += balance;
        console.log(`${name.padEnd(10)}: ${ethers.formatEther(balance).padStart(10)} ARCx`);
    }
    
    console.log(`${"TOTAL".padEnd(10)}: ${ethers.formatEther(totalDistributed).padStart(10)} ARCx`);
    console.log(`${"EXPECTED".padEnd(10)}: ${ethers.formatEther(totalSupply).padStart(10)} ARCx`);
    
    const unaccounted = totalSupply - totalDistributed;
    if (unaccounted > 0n) {
        console.log(`${"MISSING".padEnd(10)}: ${ethers.formatEther(unaccounted).padStart(10)} ARCx`);
    }
}

main().catch(console.error);
