import { ethers } from "hardhat";

async function main() {
    console.log("ARCx Ecosystem Bootstrap Vesting Setup");
    console.log("======================================");
    
    // Contract addresses
    const mvcAddress = "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B";
    const treasuryAddress = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38";
    
    // Ecosystem Bootstrap parameters
    const ecosystemSafeAddress = "0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb";
    const vestingAmount = "200000000000000000000000"; // 200,000 ARCx
    const vestingStart = 1755216000; // August 15, 2025
    const cliffDuration = 15768000;  // 6 months
    const vestingDuration = 63072000; // 24 months total vesting
    const category = 1; // ECOSYSTEM_FUND
    
    console.log("\n🌱 Ecosystem Bootstrap Configuration:");
    console.log("Beneficiary (Ecosystem Safe):", ecosystemSafeAddress);
    console.log("Amount:", ethers.formatEther(vestingAmount), "ARCx");
    console.log("Start Date:", new Date(vestingStart * 1000).toISOString());
    console.log("Cliff Period:", cliffDuration / (30 * 24 * 60 * 60), "months");
    console.log("Total Vesting:", vestingDuration / (30 * 24 * 60 * 60), "months");
    console.log("Category: ECOSYSTEM_FUND (1)");
    
    // Calculate key dates
    const cliffEnd = new Date((vestingStart + cliffDuration) * 1000);
    const vestingEnd = new Date((vestingStart + vestingDuration) * 1000);
    console.log("\n📅 Timeline:");
    console.log("Vesting Start:", new Date(vestingStart * 1000).toISOString());
    console.log("Cliff Ends (first release):", cliffEnd.toISOString());
    console.log("Vesting Completes:", vestingEnd.toISOString());
    
    // Monthly release calculation (after cliff)
    const monthlySeconds = 30 * 24 * 60 * 60; // Approximate month
    const vestingAfterCliff = vestingDuration - cliffDuration;
    const monthsAfterCliff = vestingAfterCliff / monthlySeconds;
    const monthlyRelease = parseFloat(ethers.formatEther(vestingAmount)) / monthsAfterCliff;
    console.log("Monthly Release (after cliff):", monthlyRelease.toFixed(2), "ARCx");
    
    // Get MVC contract
    const [deployer] = await ethers.getSigners();
    console.log("\n📋 Transaction Details:");
    console.log("Current signer:", deployer.address);
    console.log("MVC Contract:", mvcAddress);
    console.log("Treasury Safe (must execute):", treasuryAddress);
    
    // Connect to MVC contract
    const MVCContract = await ethers.getContractFactory("ARCxMasterVesting");
    const mvc = MVCContract.attach(mvcAddress);
    
    // Check current state
    console.log("\n🔍 Current State Check:");
    try {
        // Check if vesting already exists
        const existingVesting = await mvc.vestings(ecosystemSafeAddress);
        if (existingVesting.initialized) {
            console.log("⚠️  WARNING: Vesting already exists for this beneficiary");
            console.log("Existing amount:", ethers.formatEther(existingVesting.totalAmount), "ARCx");
            console.log("Existing category:", existingVesting.category.toString());
            return;
        } else {
            console.log("✅ No existing vesting found - ready to create");
        }
        
        // Check category allocation limits
        const categoryStats = await mvc.getCategoryStats(category);
        console.log("Ecosystem Fund allocated so far:", ethers.formatEther(categoryStats.allocated));
        console.log("Ecosystem Fund max allocation:", ethers.formatEther(categoryStats.maxAllocation));
        console.log("Remaining capacity:", ethers.formatEther(categoryStats.maxAllocation - categoryStats.allocated), "ARCx");
        
        if (BigInt(vestingAmount) > (categoryStats.maxAllocation - categoryStats.allocated)) {
            console.log("❌ ERROR: Requested amount exceeds remaining category capacity");
            return;
        }
        
        // Check contract token balance
        const tokenAddress = await mvc.token();
        const tokenContract = await ethers.getContractAt("IERC20", tokenAddress);
        const contractBalance = await tokenContract.balanceOf(mvcAddress);
        console.log("MVC contract token balance:", ethers.formatEther(contractBalance), "ARCx");
        
        if (BigInt(vestingAmount) > contractBalance) {
            console.log("❌ ERROR: Insufficient tokens in vesting contract");
            return;
        }
        
    } catch (error: any) {
        console.log("⚠️  Error checking current state:", error.message);
    }
    
    // Encode transaction data for Treasury Safe
    console.log("\n🔐 Treasury Safe Transaction Data:");
    console.log("=================================");
    
    const addVestingData = mvc.interface.encodeFunctionData("addVesting", [
        ecosystemSafeAddress,
        vestingAmount,
        vestingStart,
        cliffDuration,
        vestingDuration,
        category
    ]);
    
    console.log("To (MVC Contract):", mvcAddress);
    console.log("Value: 0");
    console.log("Data:", addVestingData);
    
    console.log("\n📝 Function Call Details:");
    console.log("Function: addVesting(address,uint256,uint256,uint64,uint64,uint8)");
    console.log("beneficiary:", ecosystemSafeAddress);
    console.log("totalAmount:", vestingAmount);
    console.log("start:", vestingStart);
    console.log("cliff:", cliffDuration);
    console.log("duration:", vestingDuration);
    console.log("category:", category);
    
    console.log("\n🎯 Next Steps:");
    console.log("1. Copy the transaction data above");
    console.log("2. Go to Treasury Safe:", treasuryAddress);
    console.log("3. Create new transaction:");
    console.log("   - To:", mvcAddress);
    console.log("   - Value: 0");
    console.log("   - Data: [paste the data above]");
    console.log("4. Submit and execute the transaction");
    console.log("5. Verify vesting creation");
    
    console.log("\n✅ Ecosystem Bootstrap vesting setup complete!");
    console.log("The Ecosystem Safe will be able to claim tokens after the 6-month cliff period.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
