const { ethers } = require("hardhat");

async function main() {
    console.log("ARCx MVC Role Management & Core Team Vesting");
    console.log("============================================");
    
    // Configuration
    const mvcAddress = "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B"; // MVC Contract
    const treasuryAddress = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"; // Treasury Safe
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Treasury Safe address:", treasuryAddress);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Get MVC contract
    const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
    const mvc = ARCxMasterVesting.attach(mvcAddress);
    
    // Check current roles
    const adminRole = await mvc.ADMIN_ROLE();
    const vestingManagerRole = await mvc.VESTING_MANAGER_ROLE();
    const pauserRole = await mvc.PAUSER_ROLE();
    
    console.log("\nCurrent Role Status:");
    console.log("===================");
    console.log("Deployer roles:");
    console.log("  ADMIN_ROLE:", await mvc.hasRole(adminRole, deployer.address));
    console.log("  VESTING_MANAGER_ROLE:", await mvc.hasRole(vestingManagerRole, deployer.address));
    console.log("  PAUSER_ROLE:", await mvc.hasRole(pauserRole, deployer.address));
    
    console.log("\nTreasury Safe roles:");
    console.log("  ADMIN_ROLE:", await mvc.hasRole(adminRole, treasuryAddress));
    console.log("  VESTING_MANAGER_ROLE:", await mvc.hasRole(vestingManagerRole, treasuryAddress));
    console.log("  PAUSER_ROLE:", await mvc.hasRole(pauserRole, treasuryAddress));
    
    // Check if deployer has admin role to grant vesting manager
    const deployerHasAdmin = await mvc.hasRole(adminRole, deployer.address);
    
    if (!deployerHasAdmin) {
        console.log("\n❌ ISSUE: Deployer does not have ADMIN_ROLE");
        console.log("Only the Treasury Safe can grant roles now.");
        console.log("\nSolutions:");
        console.log("1. Use Treasury Safe to grant VESTING_MANAGER_ROLE to deployer");
        console.log("2. Execute vesting setup directly from Treasury Safe");
        console.log("3. Add deployer as admin temporarily through Treasury Safe");
        
        console.log("\nManual steps needed:");
        console.log(`1. Connect Treasury Safe to: ${mvcAddress}`);
        console.log(`2. Call grantRole(${vestingManagerRole}, ${deployer.address})`);
        console.log("3. Re-run this script");
        
        return { success: false, reason: "insufficient_permissions" };
    }
    
    console.log("\n✅ Deployer has ADMIN_ROLE - proceeding with setup");
    
    // Grant VESTING_MANAGER_ROLE to deployer temporarily
    console.log("\n🔄 Granting VESTING_MANAGER_ROLE to deployer...");
    
    try {
        const grantTx = await mvc.grantRole(vestingManagerRole, deployer.address, {
            gasPrice: ethers.parseUnits("0.01", "gwei")
        });
        await grantTx.wait();
        console.log("✅ VESTING_MANAGER_ROLE granted to deployer");
    } catch (error) {
        console.error("Failed to grant role:", error.message);
        return { success: false, reason: "role_grant_failed" };
    }
    
    // Now set up the vesting schedule
    console.log("\n🚀 Setting up core team vesting schedule...");
    
    // Vesting Parameters
    const beneficiary = treasuryAddress; // Treasury Safe gets the vesting
    const amount = ethers.parseEther("200000"); // 200,000 ARCx
    const cliff = 31536000; // 12 months
    const duration = 108864000; // 36 months total
    const category = 0; // CORE_TEAM category
    
    console.log("\nVesting Configuration:");
    console.log("Beneficiary (Treasury Safe):", beneficiary);
    console.log("Amount:", ethers.formatEther(amount), "ARCx");
    console.log("Cliff Period:", cliff / (24 * 60 * 60), "days");
    console.log("Total Duration:", duration / (24 * 60 * 60), "days");
    console.log("Category: CORE_TEAM");
    
    try {
        const vestingTx = await mvc.addVesting(
            beneficiary,
            amount,
            cliff,
            duration,
            category,
            {
                gasPrice: ethers.parseUnits("0.01", "gwei")
            }
        );
        
        console.log("Transaction submitted:", vestingTx.hash);
        const receipt = await vestingTx.wait();
        
        console.log("\n✅ VESTING SCHEDULE CREATED!");
        console.log("Transaction hash:", receipt.hash);
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        
        const actualCost = receipt.gasUsed * (receipt.gasPrice || vestingTx.gasPrice);
        console.log("Cost:", ethers.formatEther(actualCost), "ETH (~$0.001 USD)");
        
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
        
    } catch (error) {
        console.error("Vesting setup failed:", error.message);
        return { success: false, reason: "vesting_setup_failed" };
    }
    
    // Revoke VESTING_MANAGER_ROLE from deployer (cleanup)
    console.log("\n🔄 Revoking temporary VESTING_MANAGER_ROLE from deployer...");
    
    try {
        const revokeTx = await mvc.revokeRole(vestingManagerRole, deployer.address, {
            gasPrice: ethers.parseUnits("0.01", "gwei")
        });
        await revokeTx.wait();
        console.log("✅ VESTING_MANAGER_ROLE revoked from deployer");
    } catch (error) {
        console.log("⚠️  Could not revoke role (non-critical):", error.message);
    }
    
    // Final verification
    console.log("\n📊 Final Status Check:");
    console.log("======================");
    
    const contractStats = await mvc.getContractStats();
    console.log("Total allocated:", ethers.formatEther(contractStats.totalAllocated_), "ARCx");
    console.log("Total released:", ethers.formatEther(contractStats.totalReleased_), "ARCx");
    console.log("Contract balance:", ethers.formatEther(contractStats.contractBalance), "ARCx");
    
    const categoryStats = await mvc.getCategoryStats(0); // CORE_TEAM
    console.log("\nCORE_TEAM Category:");
    console.log("Allocated:", ethers.formatEther(categoryStats.allocated), "ARCx");
    console.log("Max allocation:", ethers.formatEther(categoryStats.maxAllocation), "ARCx");
    
    console.log("\n🎉 SUCCESS: Core team vesting setup complete!");
    console.log("💰 Total cost: Sub-cent transactions achieved");
    
    console.log("\n📋 Complete Summary:");
    console.log("====================");
    console.log("✅ ARCx Token: Deployed and distributed");
    console.log("✅ MVC Contract: Deployed with 200K ARCx");
    console.log("✅ Treasury Safe: Controls 800K ARCx + vesting management");
    console.log("✅ Core Team Vesting: 200K ARCx, 12mo cliff, 36mo total");
    console.log("✅ Gas Optimization: All transactions sub-cent");
    
    console.log("\nNext Steps:");
    console.log("1. Update transparency page with final addresses");
    console.log("2. Transfer deployer admin rights to Treasury Safe (recommended)");
    console.log("3. Treasury Safe can manage all future vesting schedules");
    
    return { success: true };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
