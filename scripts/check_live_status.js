const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 ARCx Live Contract Status Check");
    console.log("==================================");
    
    try {
        // Connect to live contracts
        const tokenAddress = "0xD788D9ac56c754cb927771eBf058966bA8aB734D";
        const airdropAddress = "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195";
        const vestingAddress = "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B";
        const treasuryAddress = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38";
        
        console.log("📍 Contract Addresses:");
        console.log("Token/Auction:", tokenAddress);
        console.log("Smart Airdrop:", airdropAddress);
        console.log("Vesting (MVC):", vestingAddress);
        console.log("Treasury Safe:", treasuryAddress);
        
        // Get current block info
        const provider = ethers.provider;
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNumber);
        console.log("\n📊 Network Status:");
        console.log("Current Block:", blockNumber);
        console.log("Block Time:", new Date(block.timestamp * 1000).toISOString());
        
        // Connect to token contract
        const Token = await ethers.getContractFactory("ARCxToken");
        const token = Token.attach(tokenAddress);
        
        console.log("\n🪙 Token Contract Status:");
        const name = await token.name();
        const symbol = await token.symbol();
        const totalSupply = await token.totalSupply();
        const paused = await token.paused();
        const mintingFinalized = await token.mintingFinalized();
        
        console.log("Name:", name);
        console.log("Symbol:", symbol);
        console.log("Total Supply:", ethers.formatEther(totalSupply), "ARCx");
        console.log("Paused:", paused);
        console.log("Minting Finalized:", mintingFinalized);
        
        // Check balances
        console.log("\n💰 Token Distribution:");
        const treasuryBalance = await token.balanceOf(treasuryAddress);
        console.log("Treasury Balance:", ethers.formatEther(treasuryBalance), "ARCx");
        
        // Check if there are any major holders
        const adminAddr = "0x21e914dfbb137f7fec896f11bc8bad6bccdb147b";
        const adminBalance = await token.balanceOf(adminAddr);
        console.log("Admin Balance:", ethers.formatEther(adminBalance), "ARCx");
        
        // Get recent transfer events (if any)
        console.log("\n📈 Recent Activity Check:");
        try {
            const transferFilter = token.filters.Transfer();
            const recentTransfers = await token.queryFilter(transferFilter, blockNumber - 1000, blockNumber);
            console.log("Recent Transfers (last 1000 blocks):", recentTransfers.length);
            
            if (recentTransfers.length > 0) {
                console.log("Latest transfer:", {
                    from: recentTransfers[recentTransfers.length - 1].args[0],
                    to: recentTransfers[recentTransfers.length - 1].args[1],
                    amount: ethers.formatEther(recentTransfers[recentTransfers.length - 1].args[2]),
                    block: recentTransfers[recentTransfers.length - 1].blockNumber
                });
            }
        } catch (e) {
            console.log("Could not fetch transfer events:", e.message);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
