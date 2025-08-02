// scripts/deploy_vesting.ts

import { ethers } from "hardhat";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  // Get configuration from environment variables
  const tokenAddress = process.env.ARCX_TOKEN_ADDRESS || "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44"; // Base Mainnet
  const adminAddress = process.env.VESTING_ADMIN_ADDRESS; // Will be treasury multisig
  const vestingStartDate = process.env.VESTING_START_DATE || "2025-08-15"; // 2 weeks from now
  
  // Calculate vesting start timestamp (2 weeks from now as default)
  const vestingStart = Math.floor(new Date(vestingStartDate).getTime() / 1000);
  
  const [deployer] = await ethers.getSigners();
  const currentAdmin = adminAddress || deployer.address;
  
  console.log("ARCx Master Vesting Contract Deployment");
  console.log("==========================================");
  console.log("Deploying contract with address:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  console.log("\nVesting Configuration:");
  console.log("ARCx Token Address:", tokenAddress);
  console.log("Admin Address:", currentAdmin);
  console.log("Vesting Start Date:", new Date(vestingStart * 1000).toISOString());
  console.log("Vesting Start Timestamp:", vestingStart);
  
  // Validate token address
  try {
    const tokenContract = await ethers.getContractAt("IERC20", tokenAddress);
    const tokenSymbol = await tokenContract.symbol();
    console.log("Token Symbol:", tokenSymbol);
  } catch (error) {
    console.error("Error: Invalid token address or not accessible");
    return;
  }
  
  const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
  console.log("\nDeploying ARCxMasterVesting...");
  
  const vesting = await ARCxMasterVesting.deploy(
    tokenAddress,
    currentAdmin,
    vestingStart
  );
  await vesting.waitForDeployment();
  
  const contractAddress = await vesting.getAddress();
  console.log("\nARCxMasterVesting deployed successfully!");
  console.log("Contract address:", contractAddress);
  
  // Verify contract deployment
  console.log("\nVerifying deployment:");
  console.log("Token address:", await vesting.token());
  console.log("Global vesting start:", new Date(Number(await vesting.globalVestingStart()) * 1000).toISOString());
  
  // Check roles
  const adminRole = await vesting.ADMIN_ROLE();
  const vestingManagerRole = await vesting.VESTING_MANAGER_ROLE();
  const pauserRole = await vesting.PAUSER_ROLE();
  
  console.log("\nRole Verification:");
  console.log("Admin role granted:", await vesting.hasRole(adminRole, currentAdmin));
  console.log("Vesting manager role granted:", await vesting.hasRole(vestingManagerRole, currentAdmin));
  console.log("Pauser role granted:", await vesting.hasRole(pauserRole, currentAdmin));
  
  // Display category allocations
  console.log("\nCategory Allocation Limits:");
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
  console.log("\nContract Statistics:");
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
    admin: currentAdmin,
    vestingStart: vestingStart,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    transactionHash: vesting.deploymentTransaction()?.hash,
  };
  
  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  if (process.env.NODE_ENV !== "test") {
    console.log("\nNext Steps:");
    console.log("1. Verify contract on block explorer:");
    console.log(`   npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${contractAddress} "${tokenAddress}" "${currentAdmin}" ${vestingStart}`);
    console.log("2. Transfer ARCx tokens to vesting contract");
    console.log("3. Set up vesting schedules for each category");
    console.log("4. Transfer admin role to treasury multisig");
    console.log("\nSecurity Reminders:");
    console.log("- Test all functions on testnet first");
    console.log("- Verify all allocations before mainnet deployment");
    console.log("- Keep private keys secure");
    console.log("- Monitor contract for any issues");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
