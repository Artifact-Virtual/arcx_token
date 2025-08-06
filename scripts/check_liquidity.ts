import { ethers } from "hardhat";

async function main() {
    console.log("🏊 ARCx Liquidity Pool Status Check");
    console.log("===================================");
    
    const addresses = {
        treasury: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
        arcxToken: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44", // Wrong - should be D788D9ac
        weth: "0x4200000000000000000000000000000000000006",
        poolManager: "0x498581ff718922c3f8e6a244956af099b2652b2b",
        positionManager: "0x7c5f5a4bfd8fd63184577525326123b519429bdc"
    };
    
    // Correct the ARCx token address
    addresses.arcxToken = "0xD788D9ac56c754cb927771eBf058966bA8aB734D";
    
    const provider = ethers.provider;
    
    console.log("📍 Key Addresses:");
    Object.entries(addresses).forEach(([name, addr]) => {
        console.log(`${name.padEnd(15)}: ${addr}`);
    });
    
    // Check Treasury ETH balance for LP setup
    console.log("\n💰 Treasury Wallet Status:");
    const treasuryETH = await provider.getBalance(addresses.treasury);
    console.log(`ETH Balance: ${ethers.formatEther(treasuryETH)} ETH`);
    
    // Check if treasury has ARCx tokens
    try {
        const tokenInterface = new ethers.Interface([
            "function balanceOf(address) view returns (uint256)"
        ]);
        const tokenContract = new ethers.Contract(addresses.arcxToken, tokenInterface, provider);
        const treasuryARCx = await tokenContract.balanceOf(addresses.treasury);
        console.log(`ARCx Balance: ${ethers.formatEther(treasuryARCx)} ARCx`);
    } catch (e: any) {
        console.log(`❌ Could not check ARCx balance: ${e.message}`);
    }
    
    // Check if Uniswap V4 contracts exist
    console.log("\n🦄 Uniswap V4 Contract Status:");
    const contracts = ['poolManager', 'positionManager'];
    
    for (const contractName of contracts) {
        const code = await provider.getCode(addresses[contractName as keyof typeof addresses]);
        const exists = code !== "0x";
        console.log(`${contractName.padEnd(15)}: ${exists ? "✅ DEPLOYED" : "❌ NOT FOUND"}`);
    }
    
    // Try to check if pool is initialized
    console.log("\n🏊 Pool Status Check:");
    try {
        const poolInterface = new ethers.Interface([
            "function getSlot0(bytes32 poolId) view returns (uint160, int24, uint16, uint16)"
        ]);
        const poolContract = new ethers.Contract(addresses.poolManager, poolInterface, provider);
        
        // Pool ID from the deployment summary
        const poolId = "0x15693609e79c4c98387248b6cd07c0295e02e7f04deb6c2fe73dcd708d867f46";
        console.log(`Pool ID: ${poolId}`);
        
        const slot0 = await poolContract.getSlot0(poolId);
        console.log(`✅ Pool Initialized: sqrtPriceX96 = ${slot0[0]}`);
        
        if (slot0[0] === 0n) {
            console.log("❌ Pool NOT initialized yet");
        } else {
            console.log("✅ Pool IS initialized");
        }
        
    } catch (e: any) {
        console.log(`❌ Could not check pool status: ${e.message}`);
    }
    
    // Check for LP position NFTs in treasury
    console.log("\n🎯 LP Position NFT Check:");
    try {
        const erc721Interface = new ethers.Interface([
            "function balanceOf(address) view returns (uint256)",
            "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)"
        ]);
        const positionContract = new ethers.Contract(addresses.positionManager, erc721Interface, provider);
        
        const nftBalance = await positionContract.balanceOf(addresses.treasury);
        console.log(`Treasury LP NFTs: ${nftBalance}`);
        
        if (Number(nftBalance) > 0) {
            console.log("✅ Treasury HAS LP position NFTs");
            for (let i = 0; i < Number(nftBalance); i++) {
                const tokenId = await positionContract.tokenOfOwnerByIndex(addresses.treasury, i);
                console.log(`  NFT Token ID: ${tokenId}`);
            }
        } else {
            console.log("❌ No LP NFTs in treasury wallet");
        }
        
    } catch (e: any) {
        console.log(`❌ Could not check LP NFTs: ${e.message}`);
    }
}

main().catch(console.error);
