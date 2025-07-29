// scripts/deploy_arcx.ts

import { ethers } from "hardhat";

async function main() {
  const name = "ARCx";
  const symbol = "ARCx";
  const cap = ethers.parseEther("100000000"); // 100 million ARCx

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with address:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const ARCxToken = await ethers.getContractFactory("ARCxToken");
  console.log("Deploying ARCxToken...");
  
  const arcx = await ARCxToken.deploy(name, symbol, cap, deployer.address);
  await arcx.waitForDeployment();
  
  const contractAddress = await arcx.getAddress();
  console.log("ARCxToken deployed to:", contractAddress);
  
  // Verify contract deployment
  console.log("Token name:", await arcx.name());
  console.log("Token symbol:", await arcx.symbol());
  console.log("Max supply:", ethers.formatEther(await arcx.MAX_SUPPLY()));
  console.log("Deployment timestamp:", (await arcx.deployedAt()).toString());
  
  // Check roles
  const adminRole = await arcx.ADMIN_ROLE();
  const minterRole = await arcx.MINTER_ROLE();
  const pauserRole = await arcx.PAUSER_ROLE();
  
  console.log("Admin role granted to deployer:", await arcx.hasRole(adminRole, deployer.address));
  console.log("Minter role granted to deployer:", await arcx.hasRole(minterRole, deployer.address));
  console.log("Pauser role granted to deployer:", await arcx.hasRole(pauserRole, deployer.address));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
