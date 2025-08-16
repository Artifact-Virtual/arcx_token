// scripts/grant-auction-admin.ts
// Grant AUCTION_ADMIN role to treasury so it can call finalize()

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader } from "./shared/utils";

async function main() {
  displayScriptHeader(
    "Grant AUCTION_ADMIN Role",
    "Grant AUCTION_ADMIN role to treasury address"
  );

  const [signer] = await ethers.getSigners();
  console.log(`\n🔐 Signer: ${signer.address}`);

  const auction = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
  
  const AUCTION_ADMIN = await auction.AUCTION_ADMIN();
  const treasuryHasRole = await auction.hasRole(AUCTION_ADMIN, CONTRACTS.TREASURY_SAFE);
  
  console.log(`\nAUCTION_ADMIN role: ${AUCTION_ADMIN}`);
  console.log(`Treasury has role: ${treasuryHasRole ? "YES" : "NO"}`);
  
  if (treasuryHasRole) {
    console.log("✅ Treasury already has AUCTION_ADMIN role");
    return;
  }
  
  console.log("\n🎯 Granting AUCTION_ADMIN role to treasury...");
  
  try {
    const tx = await auction.grantRole(AUCTION_ADMIN, CONTRACTS.TREASURY_SAFE);
    console.log(`📝 Transaction: ${tx.hash}`);
    
    const receipt = await tx.wait();
    if (receipt?.status === 1) {
      console.log("✅ Role granted successfully!");
      
      // Verify
      const newHasRole = await auction.hasRole(AUCTION_ADMIN, CONTRACTS.TREASURY_SAFE);
      console.log(`Treasury now has AUCTION_ADMIN: ${newHasRole ? "YES" : "NO"}`);
    }
  } catch (error: any) {
    console.log(`❌ Failed to grant role: ${error.message}`);
  }

  console.log("\n📋 UPDATED TRANSACTION DATA FOR TREASURY:");
  console.log("==========================================");
  console.log(`To: ${CONTRACTS.DUTCH_AUCTION}`);
  console.log(`Value: 0`);
  console.log(`Data: 0x4bb278f3`);
  console.log("\n✅ Treasury can now call finalize()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
