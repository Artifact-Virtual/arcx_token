// scripts/deploy_arcx.js

const { ethers } = require("hardhat");

async function main() {
  const name = "ARCx";
  const symbol = "ARCx";
  const cap = ethers.utils.parseEther("100000000"); // 100 million ARCx

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with address:", deployer.address);

  const ARCxToken = await ethers.getContractFactory("ARCxToken");
  const arcx = await ARCxToken.deploy(name, symbol, cap, deployer.address);
  await arcx.deployed();

  console.log("ARCxToken deployed to:", arcx.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
