// scripts/deploy_arcx.ts

import { ethers } from "hardhat";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  // Get configuration from environment variables
  const name = process.env.TOKEN_NAME || "ARCx";
  const symbol = process.env.TOKEN_SYMBOL || "ARCx";
  const maxSupply = process.env.TOKEN_MAX_SUPPLY || "100000000"; // 100 million ARCx
  const cap = ethers.parseEther(maxSupply);
  
  const [deployer] = await ethers.getSigners();
  const initialAdmin = process.env.INITIAL_ADMIN_ADDRESS || deployer.address;
  
  console.log("ARCx Token Deployment");
  console.log("========================");
  console.log("Deploying contract with address:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  
  console.log("\nToken Configuration:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Max Supply:", ethers.formatEther(cap), symbol);
  console.log("Initial Admin:", initialAdmin);
  
  const ARCxToken = await ethers.getContractFactory("ARCxToken");
  console.log("\nDeploying ARCxToken...");
  
  const arcx = await ARCxToken.deploy(name, symbol, cap, initialAdmin);
  await arcx.waitForDeployment();
  
  const contractAddress = await arcx.getAddress();
  console.log("\nARCxToken deployed successfully!");
  console.log("Contract address:", contractAddress);
  
  // Verify contract deployment
  console.log("\nVerifying deployment:");
  console.log("Token name:", await arcx.name());
  console.log("Token symbol:", await arcx.symbol());
  console.log("Max supply:", ethers.formatEther(await arcx.MAX_SUPPLY()));
  console.log("Deployment timestamp:", new Date(Number(await arcx.deployedAt()) * 1000).toISOString());
  
  // Check roles
  const adminRole = await arcx.ADMIN_ROLE();
  const minterRole = await arcx.MINTER_ROLE();
  const pauserRole = await arcx.PAUSER_ROLE();
  
  console.log("\nRole Verification:");
  console.log("Admin role granted to initial admin:", await arcx.hasRole(adminRole, initialAdmin));
  console.log("Minter role granted to initial admin:", await arcx.hasRole(minterRole, initialAdmin));
  console.log("Pauser role granted to initial admin:", await arcx.hasRole(pauserRole, initialAdmin));
  
  // Bridge status
  console.log("\nBridge Status:");
  console.log("Fuel bridge address:", await arcx.fuelBridge());
  console.log("Bridge locked:", await arcx.bridgeLocked());
  console.log("Minting finalized:", await arcx.mintingFinalized());
  
  console.log("\nContract Statistics:");
  console.log("Total supply:", ethers.formatEther(await arcx.totalSupply()));
  console.log("Contract paused:", await arcx.paused());
  
  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    initialAdmin: initialAdmin,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    tokenName: name,
    tokenSymbol: symbol,
    maxSupply: maxSupply,
    transactionHash: arcx.deploymentTransaction()?.hash,
  };
  
  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  if (process.env.NODE_ENV !== "test") {
    console.log("\nNext Steps:");
    console.log("1. Verify contract on block explorer:");
    console.log(`   npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${contractAddress} "${name}" "${symbol}" "${cap}" "${initialAdmin}"`);
    console.log("2. Set up role management as needed");
    console.log("3. Configure bridge address when ready");
    console.log("4. Begin initial token distribution");
    console.log("\nSecurity Reminders:");
    console.log("- Secure your private keys");
    console.log("- Test all functions before mainnet use");
    console.log("- Monitor contract for any issues");
    console.log("- Keep documentation updated");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  });
