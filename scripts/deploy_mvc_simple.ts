const { ethers } = require("hardhat");

async function main() {
  console.log("ARCx Master Vesting Contract Deployment");
  console.log("==========================================");
  
  // Get configuration
  const tokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44"; // ARCx Token on Base
  const treasuryAddress = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"; // Treasury Safe
  const vestingStartDate = "2025-08-15"; // 2 weeks from now
  
  // Calculate vesting start timestamp
  const vestingStart = Math.floor(new Date(vestingStartDate).getTime() / 1000);
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with address:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  console.log("\nVesting Configuration:");
  console.log("ARCx Token Address:", tokenAddress);
  console.log("Treasury Admin Address:", treasuryAddress);
  console.log("Vesting Start Date:", new Date(vestingStart * 1000).toISOString());
  console.log("Vesting Start Timestamp:", vestingStart);
  
  // Validate token address by checking if it's a contract
  try {
    const code = await ethers.provider.getCode(tokenAddress);
    if (code === "0x") {
      console.error("❌ Error: Token address is not a contract");
      return;
    }
    console.log("✅ Token contract validated");
  } catch (error) {
    console.error("❌ Error: Cannot access token contract");
    return;
  }
  
  console.log("\n🚀 Deploying ARCxMasterVesting...");
  
  const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
  const vesting = await ARCxMasterVesting.deploy(
    tokenAddress,
    treasuryAddress, // Set treasury as admin
    vestingStart
  );
  
  await vesting.waitForDeployment();
  
  const contractAddress = await vesting.getAddress();
  console.log("\n✅ ARCxMasterVesting deployed successfully!");
  console.log("📋 Contract address:", contractAddress);
  
  // Verify contract deployment
  console.log("\n🔍 Verifying deployment:");
  console.log("Token address:", await vesting.token());
  console.log("Global vesting start:", new Date(Number(await vesting.globalVestingStart()) * 1000).toISOString());
  
  // Check roles
  const adminRole = await vesting.ADMIN_ROLE();
  const vestingManagerRole = await vesting.VESTING_MANAGER_ROLE();
  const pauserRole = await vesting.PAUSER_ROLE();
  
  console.log("\n🔑 Role Verification:");
  console.log("Admin role granted to treasury:", await vesting.hasRole(adminRole, treasuryAddress));
  console.log("Vesting manager role granted to treasury:", await vesting.hasRole(vestingManagerRole, treasuryAddress));
  console.log("Pauser role granted to treasury:", await vesting.hasRole(pauserRole, treasuryAddress));
  
  // Display category allocations
  console.log("\n📊 Category Allocation Limits:");
  const categories = [
    "CORE_TEAM",
    "ECOSYSTEM_FUND", 
    "COMMUNITY_AIRDROP",
    "STRATEGIC_PARTNERS",
    "PUBLIC_SALE",
    "TREASURY_RESERVE"
  ];
  
  for (let i = 0; i < categories.length; i++) {
    const stats = await vesting.getCategoryStats(i);
    console.log(`${categories[i]}: ${ethers.formatEther(stats.maxAllocation)} ARCx max`);
  }
  
  // Get contract stats
  const contractStats = await vesting.getContractStats();
  console.log("\n📈 Contract Statistics:");
  console.log("Total allocated:", ethers.formatEther(contractStats.totalAllocated_));
  console.log("Total released:", ethers.formatEther(contractStats.totalReleased_));
  console.log("Contract token balance:", ethers.formatEther(contractStats.contractBalance));
  console.log("Contract paused:", await vesting.paused());
  
  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    contractAddress: contractAddress,
    tokenAddress: tokenAddress,
    deployer: deployer.address,
    admin: treasuryAddress,
    vestingStart: vestingStart,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    transactionHash: vesting.deploymentTransaction()?.hash,
  };
  
  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Verify contract on BaseScan:");
  console.log(`   npx hardhat verify --network base ${contractAddress} "${tokenAddress}" "${treasuryAddress}" ${vestingStart}`);
  console.log("2. Transfer ARCx tokens to vesting contract:");
  console.log(`   Transfer 200,000 ARCx to: ${contractAddress}`);
  console.log("3. Set up vesting schedule for core team");
  console.log("4. Update transparency page with new addresses");
  
  console.log("\n⚠️  IMPORTANT:");
  console.log("- Save the contract address:", contractAddress);
  console.log("- Treasury Safe has all admin roles");
  console.log("- No tokens transferred yet - requires separate transaction");
  console.log("- Ready to proceed with token transfer and vesting setup");
  
  return {
    contractAddress,
    tokenAddress,
    treasuryAddress,
    vestingStart,
    deploymentInfo
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
