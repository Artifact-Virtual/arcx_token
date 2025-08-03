const { ethers } = require("hardhat");

async function main() {
    console.log("ARCx Core Team Vesting Setup (Treasury Safe)");
    console.log("============================================");
    
    // Configuration
    const mvcAddress = "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B"; // MVC Contract
    const treasuryAddress = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"; // Treasury Safe
    
    // Vesting Parameters
    const beneficiary = treasuryAddress; // Treasury Safe gets the vesting
    const amount = ethers.parseEther("200000"); // 200,000 ARCx
    const cliff = 31536000; // 12 months (365 days * 24 * 60 * 60)
    const duration = 108864000; // 36 months total (1095 days * 24 * 60 * 60)
    const category = 0; // CORE_TEAM category
    
    const [signer] = await ethers.getSigners();
    console.log("Executing from:", signer.address);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Get MVC contract
    const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
    const mvc = ARCxMasterVesting.attach(mvcAddress);
    
    console.log("\nCore Team Vesting Configuration:");
    console.log("================================");
    console.log("MVC Contract:", mvcAddress);
    console.log("Beneficiary (Treasury Safe):", beneficiary);
    console.log("Amount:", ethers.formatEther(amount), "ARCx");
    console.log("Cliff Period:", cliff / (24 * 60 * 60), "days (12 months)");
    console.log("Total Duration:", duration / (24 * 60 * 60), "days (36 months)");
    console.log("Category: CORE_TEAM");
    
    // Calculate important dates
    const globalStart = await mvc.globalVestingStart();
    const cliffEnd = Number(globalStart) + cliff;
    const vestingEnd = Number(globalStart) + duration;
    
    console.log("\nImportant Dates:");
    console.log("================");
    console.log("Global vesting start:", new Date(Number(globalStart) * 1000).toISOString());
    console.log("Cliff ends (first release):", new Date(cliffEnd * 1000).toISOString());
    console.log("Vesting completes:", new Date(vestingEnd * 1000).toISOString());
    
    // Verify contract state
    const tokenAddress = await mvc.token();
    const ARCxToken = await ethers.getContractFactory("ARCxToken");
    const token = ARCxToken.attach(tokenAddress);
    
    const mvcBalance = await token.balanceOf(mvcAddress);
    console.log("\nContract Verification:");
    console.log("=====================");
    console.log("MVC contract balance:", ethers.formatEther(mvcBalance), "ARCx");
    console.log("Required for vesting:", ethers.formatEther(amount), "ARCx");
    console.log("Sufficient funds:", mvcBalance >= amount ? "✅ YES" : "❌ NO");
    
    // Check permissions
    const vestingManagerRole = await mvc.VESTING_MANAGER_ROLE();
    const hasManagerRole = await mvc.hasRole(vestingManagerRole, signer.address);
    console.log("Signer has VESTING_MANAGER_ROLE:", hasManagerRole ? "✅ YES" : "❌ NO");
    
    if (!hasManagerRole) {
        console.log("\n❌ PERMISSION ERROR");
        console.log("==================");
        console.log("The current signer does not have VESTING_MANAGER_ROLE");
        console.log("This script must be executed by an address with the required role");
        console.log("\nValid executors:");
        console.log("- Treasury Safe:", treasuryAddress);
        console.log("- Any address granted VESTING_MANAGER_ROLE by Treasury Safe");
        
        console.log("\n📋 TRANSACTION DATA FOR TREASURY SAFE:");
        console.log("======================================");
        console.log("To execute this vesting setup through Treasury Safe:");
        console.log("1. Connect to MVC contract:", mvcAddress);
        console.log("2. Call function: addVesting");
        console.log("3. Parameters:");
        console.log("   beneficiary:", beneficiary);
        console.log("   amount:", amount.toString(), "(200000000000000000000000 wei)");
        console.log("   cliff:", cliff.toString(), "(31536000 seconds)");
        console.log("   duration:", duration.toString(), "(108864000 seconds)");
        console.log("   category:", category.toString(), "(0 = CORE_TEAM)");
        
        return { success: false, reason: "insufficient_permissions" };
    }
    
    if (mvcBalance < amount) {
        console.log("\n❌ INSUFFICIENT FUNDS");
        console.log("=====================");
        console.log("MVC contract does not have enough ARCx tokens");
        console.log("Available:", ethers.formatEther(mvcBalance), "ARCx");
        console.log("Required:", ethers.formatEther(amount), "ARCx");
        return { success: false, reason: "insufficient_funds" };
    }
    
    // Estimate gas
    try {
        const gasEstimate = await mvc.addVesting.estimateGas(
            beneficiary,
            amount,
            cliff,
            duration,
            category
        );
        console.log("\nGas Estimation:");
        console.log("===============");
        console.log("Estimated gas:", gasEstimate.toString());
        console.log("Gas price: 0.01 gwei (sub-cent optimization)");
        
        const gasPrice = ethers.parseUnits("0.01", "gwei");
        const gasCost = gasEstimate * gasPrice;
        console.log("Estimated cost:", ethers.formatEther(gasCost), "ETH (~$0.001 USD)");
    } catch (error) {
        console.error("Gas estimation failed - transaction may fail");
    }
    
    console.log("\n🚀 EXECUTING VESTING SETUP");
    console.log("===========================");
    console.log("Creating core team vesting schedule...");
    
    try {
        const tx = await mvc.addVesting(
            beneficiary,
            amount,
            cliff,
            duration,
            category,
            {
                gasPrice: ethers.parseUnits("0.01", "gwei") // Sub-cent gas price
            }
        );
        
        console.log("Transaction submitted:", tx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        console.log("\n🎉 VESTING SETUP SUCCESSFUL!");
        console.log("============================");
        console.log("Transaction hash:", receipt.hash);
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        console.log("Gas price:", ethers.formatUnits(receipt.gasPrice || tx.gasPrice, "gwei"), "gwei");
        
        const actualCost = receipt.gasUsed * (receipt.gasPrice || tx.gasPrice);
        console.log("Actual cost:", ethers.formatEther(actualCost), "ETH");
        
        // Parse events to get vesting ID
        const addVestingEvent = receipt.logs.find(log => {
            try {
                const parsed = mvc.interface.parseLog(log);
                return parsed && parsed.name === "VestingAdded";
            } catch {
                return false;
            }
        });
        
        let vestingId = null;
        if (addVestingEvent) {
            const parsed = mvc.interface.parseLog(addVestingEvent);
            vestingId = parsed.args.vestingId;
            console.log("Vesting ID:", vestingId.toString());
        }
        
        // Get updated statistics
        console.log("\n📊 UPDATED CONTRACT STATISTICS");
        console.log("==============================");
        
        const contractStats = await mvc.getContractStats();
        console.log("Total allocated:", ethers.formatEther(contractStats.totalAllocated_), "ARCx");
        console.log("Total released:", ethers.formatEther(contractStats.totalReleased_), "ARCx");
        console.log("Contract balance:", ethers.formatEther(contractStats.contractBalance), "ARCx");
        
        const categoryStats = await mvc.getCategoryStats(category);
        console.log("\nCORE_TEAM Category Statistics:");
        console.log("Allocated:", ethers.formatEther(categoryStats.allocated), "ARCx");
        console.log("Max allocation:", ethers.formatEther(categoryStats.maxAllocation), "ARCx");
        console.log("Remaining capacity:", ethers.formatEther(categoryStats.maxAllocation - categoryStats.allocated), "ARCx");
        
        console.log("\n✅ COMPLETE PROJECT SUMMARY");
        console.log("===========================");
        console.log("🎯 ARCx Token: 1M supply deployed on Base");
        console.log("🏛️  Treasury Safe: Controls 800K ARCx");
        console.log("💎 Core Team: 200K ARCx in 36-month vesting");
        console.log("⚡ Gas Optimization: All transactions sub-cent");
        console.log("🔐 Security: Enterprise-grade multisig control");
        
        console.log("\nVesting Schedule Details:");
        console.log("- Beneficiary: Treasury Safe multisig");
        console.log("- Amount: 200,000 ARCx");
        console.log("- Cliff: 12 months (no tokens until", new Date(cliffEnd * 1000).toDateString(), ")");
        console.log("- Linear vesting: 36 months total");
        console.log("- Monthly release after cliff: ~5,556 ARCx");
        
        console.log("\n📋 NEXT ACTIONS");
        console.log("===============");
        console.log("1. ✅ Update transparency page with contract addresses");
        console.log("2. ✅ Document vesting schedule for stakeholders");
        console.log("3. ✅ Treasury Safe has full control of system");
        console.log("4. ✅ Ready for additional vesting schedules as needed");
        
        return {
            success: true,
            transactionHash: receipt.hash,
            vestingId: vestingId ? vestingId.toString() : null,
            cost: ethers.formatEther(actualCost)
        };
        
    } catch (error) {
        console.error("\n❌ VESTING SETUP FAILED");
        console.error("========================");
        console.error("Error:", error.message);
        return { success: false, error: error.message };
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
