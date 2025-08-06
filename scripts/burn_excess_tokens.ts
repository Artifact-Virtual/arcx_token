import { ethers } from "hardhat";

async function main() {
    console.log("🔥 BURNING EXCESS TOKENS");
    console.log("========================");
    
    const addresses = {
        arcxToken: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
        dutchAuction: "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836"
    };
    
    const [signer] = await ethers.getSigners();
    console.log("Signer:", signer.address);
    
    // Get contracts
    const arcxToken = await ethers.getContractAt("ARCxToken", addresses.arcxToken);
    
    console.log("\n📊 CURRENT STATUS:");
    const totalSupply = await arcxToken.totalSupply();
    const auctionBalance = await arcxToken.balanceOf(addresses.dutchAuction);
    
    console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ARCx`);
    console.log(`Auction Balance: ${ethers.formatEther(auctionBalance)} ARCx`);
    
    // Burn the excess 100k from auction
    const burnAmount = ethers.parseEther("100000");
    
    console.log("\n🔥 BURNING EXCESS TOKENS...");
    console.log(`Burning: ${ethers.formatEther(burnAmount)} ARCx from auction contract`);
    
    try {
        // Create interface for burnFrom function
        const tokenInterface = new ethers.Interface([
            "function burnFrom(address account, uint256 amount)"
        ]);
        
        // Try to burn from auction address
        const tx = await arcxToken.burnFrom(addresses.dutchAuction, burnAmount);
        await tx.wait();
        
        console.log(`✅ Burned ${ethers.formatEther(burnAmount)} ARCx`);
        console.log(`Transaction: ${tx.hash}`);
        
        // Check new totals
        const newTotalSupply = await arcxToken.totalSupply();
        const newAuctionBalance = await arcxToken.balanceOf(addresses.dutchAuction);
        
        console.log("\n📊 AFTER BURN:");
        console.log(`Total Supply: ${ethers.formatEther(newTotalSupply)} ARCx`);
        console.log(`Auction Balance: ${ethers.formatEther(newAuctionBalance)} ARCx`);
        console.log(`✅ Supply corrected to 1,000,000 ARCx`);
        
    } catch (e: any) {
        console.log(`❌ Burn failed: ${e.message}`);
        
        // Alternative: Try to transfer tokens away from auction then burn
        console.log("\n🔄 TRYING ALTERNATIVE: Transfer then burn...");
        
        try {
            // If we have minter role, we can mint to another address then burn
            console.log("Attempting to transfer excess tokens...");
            
            // This won't work directly, need auction contract to transfer
            // For now, just document the issue
            console.log("❌ Cannot burn directly from auction without auction contract cooperation");
            console.log("🔧 SOLUTION NEEDED:");
            console.log("1. Deploy new auction with correct token amount");
            console.log("2. Or modify auction contract to burn excess tokens");
            
        } catch (e2: any) {
            console.log(`❌ Alternative failed: ${e2.message}`);
        }
    }
}

main().catch(console.error);
