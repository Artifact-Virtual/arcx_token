import { ethers } from "hardhat";

async function main() {
    console.log("🔍 FULL TOKEN FORENSIC ANALYSIS");
    console.log("================================");
    
    const tokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
    const token = await ethers.getContractAt("ARCxToken", tokenAddress);
    
    // Get all Transfer events from the beginning
    console.log("📊 ANALYZING ALL MINT EVENTS (FROM ZERO ADDRESS):");
    
    const mintFilter = token.filters.Transfer(ethers.ZeroAddress);
    const allMintEvents = await token.queryFilter(mintFilter, 0);
    
    console.log(`Found ${allMintEvents.length} total mint events:`);
    
    let totalMinted = 0n;
    for (const event of allMintEvents) {
        if ('args' in event) {
            const [from, to, amount] = event.args;
            const amountFormatted = ethers.formatEther(amount);
            totalMinted += amount;
            console.log(`Block ${event.blockNumber}: Minted ${amountFormatted} ARCx to ${to}`);
        }
    }
    
    console.log(`\nTOTAL MINTED: ${ethers.formatEther(totalMinted)} ARCx`);
    
    // Check balances of all known addresses
    console.log("\n💰 COMPLETE BALANCE ANALYSIS:");
    
    const addresses = {
        "Treasury Safe": "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
        "Dutch Auction": "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836",
        "Smart Airdrop": "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195",
        "Deployer": "0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B",
        "MVC Contract": "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B",
        "Ecosystem Safe": "0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb"
    };
    
    let totalAccountedFor = 0n;
    
    for (const [name, address] of Object.entries(addresses)) {
        try {
            const balance = await token.balanceOf(address);
            totalAccountedFor += balance;
            console.log(`${name.padEnd(15)}: ${ethers.formatEther(balance).padStart(12)} ARCx - ${address}`);
        } catch (e) {
            console.log(`${name.padEnd(15)}: ERROR - ${address}`);
        }
    }
    
    console.log(`${"".padEnd(15)}  ${"".padStart(12, "-")}`);
    console.log(`${"TOTAL FOUND".padEnd(15)}: ${ethers.formatEther(totalAccountedFor).padStart(12)} ARCx`);
    
    const currentSupply = await token.totalSupply();
    const unaccounted = currentSupply - totalAccountedFor;
    
    console.log(`${"TOTAL SUPPLY".padEnd(15)}: ${ethers.formatEther(currentSupply).padStart(12)} ARCx`);
    console.log(`${"UNACCOUNTED".padEnd(15)}: ${ethers.formatEther(unaccounted).padStart(12)} ARCx`);
    
    if (unaccounted > 0n) {
        console.log("\n🚨 MYSTERY TOKENS DETECTED!");
        console.log("Need to find where these tokens are located.");
        
        // Check if unaccounted tokens are in deployer or other addresses
        console.log("\n🔍 CHECKING ADDITIONAL ADDRESSES:");
        
        // Check recent transaction recipients
        const recentTransfers = await token.queryFilter(token.filters.Transfer(), -1000);
        const uniqueAddresses = new Set();
        
        for (const event of recentTransfers) {
            if ('args' in event) {
                const [from, to, amount] = event.args;
                if (to !== ethers.ZeroAddress) uniqueAddresses.add(to);
                if (from !== ethers.ZeroAddress) uniqueAddresses.add(from);
            }
        }
        
        console.log(`Checking ${uniqueAddresses.size} addresses from recent activity...`);
        
        for (const addr of uniqueAddresses) {
            if (!Object.values(addresses).includes(addr)) {
                try {
                    const balance = await token.balanceOf(addr);
                    if (balance > 0n) {
                        console.log(`${addr}: ${ethers.formatEther(balance)} ARCx`);
                    }
                } catch (e) {
                    // Skip invalid addresses
                }
            }
        }
    }
}

main().catch(console.error);
