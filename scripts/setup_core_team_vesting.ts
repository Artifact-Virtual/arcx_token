const { ethers } = require("hardhat");

async function main() {
    console.log("ARCx Core Team Vesting Setup");
    console.log("============================");
    
    // Configuration
    const mvcAddress = "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B"; // MVC Contract
    const treasuryAddress = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"; // Treasury Safe
    
    // Vesting Parameters
    const beneficiary = treasuryAddress; // Treasury Safe gets the vesting
    const amount = ethers.parseEther("200000"); // 200,000 ARCx
    const cliff = 31536000; // 12 months (365 days * 24 hours * 60 minutes * 60 seconds)
    const duration = 108864000; // 36 months total (1095 days * 24 hours * 60 minutes * 60 seconds)
    const category = 0; // CORE_TEAM category
    
    const [deployer] = await ethers.getSigners();
    console.log("Setting up vesting from:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Get MVC contract
    const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
    const mvc = ARCxMasterVesting.attach(mvcAddress);
    
    console.log("\nCore Team Vesting Configuration:");
    console.log("MVC Contract:", mvcAddress);
    console.log("Beneficiary (Treasury Safe):", beneficiary);
    console.log("Amount:", ethers.formatEther(amount), "ARCx");
    console.log("Cliff Period:", cliff / (24 * 60 * 60), "days");
    console.log("Total Duration:", duration / (24 * 60 * 60), "days");
    console.log("Category: CORE_TEAM");
    
    // Verify MVC contract has tokens
    const tokenAddress = await mvc.token();
    const ARCxToken = await ethers.getContractFactory("ARCxToken");
    const token = ARCxToken.attach(tokenAddress);
    
    const mvcBalance = await token.balanceOf(mvcAddress);
    console.log("\nBalance Check:");
    console.log("MVC contract balance:", ethers.formatEther(mvcBalance), "ARCx");
    console.log("Required for vesting:", ethers.formatEther(amount), "ARCx");
    
    if (mvcBalance < amount) {
        console.error("ERROR: Insufficient ARCx balance in MVC contract");
        console.log("Available:", ethers.formatEther(mvcBalance), "ARCx");
        console.log("Required:", ethers.formatEther(amount), "ARCx");
        return;
    }
    
    // Check deployer has VESTING_MANAGER_ROLE
    const vestingManagerRole = await mvc.VESTING_MANAGER_ROLE();
    const hasManagerRole = await mvc.hasRole(vestingManagerRole, deployer.address);
    console.log("Deployer has VESTING_MANAGER_ROLE:", hasManagerRole);
    
    if (!hasManagerRole) {
        console.error("ERROR: Deployer does not have VESTING_MANAGER_ROLE");
        console.log("Only addresses with VESTING_MANAGER_ROLE can add vesting schedules");
        return;
    }
    
    // Estimate gas for vesting setup
    try {
        const gasEstimate = await mvc.addVesting.estimateGas(
            beneficiary,
            amount,
            cliff,
            duration,
            category
        );
        console.log("\nGas Estimation:");
        console.log("Estimated gas:", gasEstimate.toString());
        console.log("Gas price: 0.01 gwei (sub-cent optimization)");
        
        const gasPrice = ethers.parseUnits("0.01", "gwei");
        const gasCost = gasEstimate * gasPrice;
        console.log("Estimated cost:", ethers.formatEther(gasCost), "ETH (~$0.001 USD)");
    } catch (error) {
        console.error("Gas estimation failed:", error.message);
        return;
    }
    
    console.log("\nExecuting vesting setup...");
    console.log("🚀 Adding core team vesting schedule...");
    
    // Execute the vesting setup with optimized gas
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
        
        console.log("\n✅ VESTING SETUP SUCCESSFUL!");
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
                return parsed.name === "VestingAdded";
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
        
        // Verify the vesting schedule
        console.log("\nVerifying vesting schedule:");
        if (vestingId) {
            try {
                const vestingInfo = await mvc.getVestingInfo(vestingId);
                console.log("Beneficiary:", vestingInfo.beneficiary);
                console.log("Total amount:", ethers.formatEther(vestingInfo.totalAmount), "ARCx");
                console.log("Released amount:", ethers.formatEther(vestingInfo.releasedAmount), "ARCx");
                console.log("Cliff end:", new Date(Number(vestingInfo.cliffEnd) * 1000).toISOString());
                console.log("Vesting end:", new Date(Number(vestingInfo.vestingEnd) * 1000).toISOString());
                console.log("Category:", vestingInfo.category.toString(), "(CORE_TEAM)");
            } catch (error) {
                console.log("Could not retrieve vesting info (may need to wait for indexing)");
            }
        }
        
        // Get contract stats
        const contractStats = await mvc.getContractStats();
        console.log("\nUpdated Contract Statistics:");
        console.log("Total allocated:", ethers.formatEther(contractStats.totalAllocated_), "ARCx");
        console.log("Total released:", ethers.formatEther(contractStats.totalReleased_), "ARCx");
        console.log("Contract balance:", ethers.formatEther(contractStats.contractBalance), "ARCx");
        
        // Get category stats
        const categoryStats = await mvc.getCategoryStats(category);
        console.log("\nCORE_TEAM Category Statistics:");
        console.log("Allocated:", ethers.formatEther(categoryStats.allocated), "ARCx");
        console.log("Max allocation:", ethers.formatEther(categoryStats.maxAllocation), "ARCx");
        console.log("Remaining:", ethers.formatEther(categoryStats.maxAllocation - categoryStats.allocated), "ARCx");
        
        console.log("\n🎉 SUCCESS: Core team vesting schedule created!");
        console.log("💰 Cost: Sub-cent transaction achieved (~$0.001 USD)");
        
        console.log("\n📋 Vesting Schedule Summary:");
        console.log("===============================");
        console.log("🏛️  Beneficiary: Treasury Safe multisig");
        console.log("💎 Amount: 200,000 ARCx");
        console.log("⏰ Cliff: 12 months (no tokens released)");
        console.log("📅 Duration: 36 months total linear vesting");
        console.log("🔐 Category: CORE_TEAM");
        
        console.log("\nNext Steps:");
        console.log("1. Update transparency page with vesting details");
        console.log("2. Document vesting schedule for stakeholders");
        console.log("3. Treasury Safe can manage vesting contract");
        console.log("4. Tokens will be releasable after cliff period");
        
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            cost: ethers.formatEther(actualCost),
            vestingId: vestingId ? vestingId.toString() : null
        };
        
    } catch (error) {
        console.error("Vesting setup failed:", error.message);
        return { success: false, error: error.message };
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
