// scripts/current_deployment_status.ts
// Check current deployment status and clarify addresses

import { ethers } from "hardhat";

async function main() {
    console.log("📋 CURRENT DEPLOYMENT STATUS");
    console.log("=============================");
    console.log("Date:", new Date().toISOString());
    
    // Known addresses from README and deployment
    const addresses = {
        "Token Contract (from README)": "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
        "New Dutch Auction (just deployed)": "0xB66e928C556362c513BB999dF4a4Ed2e76A8ACA3", 
        "Smart Airdrop (from README)": "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195",
        "Vesting Contract": "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B",
        "Treasury Safe": "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"
    };
    
    console.log("\n📍 CONTRACT ADDRESSES:");
    for (const [name, address] of Object.entries(addresses)) {
        console.log(`${name}: ${address}`);
    }
    
    console.log("\n🔍 CHECKING CONTRACT STATUS:");
    
    for (const [name, address] of Object.entries(addresses)) {
        try {
            const code = await ethers.provider.getCode(address);
            const balance = await ethers.provider.getBalance(address);
            
            if (code === "0x") {
                console.log(`❌ ${name}: NOT DEPLOYED`);
            } else {
                console.log(`✅ ${name}: DEPLOYED (${ethers.formatEther(balance)} ETH)`);
            }
        } catch (error) {
            console.log(`⚠️  ${name}: ERROR CHECKING`);
        }
    }
    
    console.log("\n🚨 CRITICAL ISSUE IDENTIFIED:");
    console.log("Your README shows the SAME address for Token Contract AND Dutch Auction!");
    console.log("This is incorrect - they should be different contracts.");
    console.log("");
    console.log("ACTUAL SITUATION:");
    console.log("✅ Token Contract: 0xA4093669DAFbD123E37d52e0939b3aB3C2272f44");
    console.log("✅ NEW Dutch Auction: 0xB66e928C556362c513BB999dF4a4Ed2e76A8ACA3");
    console.log("✅ Smart Airdrop: 0x79166AbC8c17017436263BcE5f76DaB1c3dEa195");
    
    console.log("\n🎯 NEXT STEPS NEEDED:");
    console.log("1. Update README.md with correct Dutch Auction address");
    console.log("2. Transfer 100,000 ARCx to NEW auction: 0xB66e928C556362c513BB999dF4a4Ed2e76A8ACA3");
    console.log("3. Deploy Smart Airdrop if needed");
    console.log("4. Update all documentation with correct addresses");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
