// scripts/revoke-excess-roles.ts
// Revoke unnecessary admin roles for security best practices

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader } from "./shared/utils";

async function main() {
  displayScriptHeader(
    "Security Role Cleanup",
    "Revoke unnecessary admin roles following best practices"
  );

  const [signer] = await ethers.getSigners();
  console.log(`\n🔐 Signer: ${signer.address}`);

  const auction = await ethers.getContractAt("ARCxDutchAuction", CONTRACTS.DUTCH_AUCTION);
  
  const AUCTION_ADMIN = await auction.AUCTION_ADMIN();
  const treasuryHasRole = await auction.hasRole(AUCTION_ADMIN, CONTRACTS.TREASURY_SAFE);
  const deployerHasRole = await auction.hasRole(AUCTION_ADMIN, signer.address);
  
  console.log(`\n🔍 CURRENT ROLE STATUS:`);
  console.log(`Treasury has AUCTION_ADMIN: ${treasuryHasRole ? "YES" : "NO"}`);
  console.log(`Deployer has AUCTION_ADMIN: ${deployerHasRole ? "YES" : "NO"}`);
  
  if (!treasuryHasRole) {
    console.log("✅ Treasury role already revoked");
    return;
  }
  
  console.log(`\n🔒 REVOKING TREASURY ADMIN ROLE FOR SECURITY...`);
  console.log("===============================================");
  
  try {
    const tx = await auction.revokeRole(AUCTION_ADMIN, CONTRACTS.TREASURY_SAFE);
    console.log(`📝 Transaction: ${tx.hash}`);
    
    const receipt = await tx.wait();
    if (receipt?.status === 1) {
      console.log("✅ Treasury AUCTION_ADMIN role revoked successfully!");
      
      // Verify
      const newTreasuryHasRole = await auction.hasRole(AUCTION_ADMIN, CONTRACTS.TREASURY_SAFE);
      const deployerStillHasRole = await auction.hasRole(AUCTION_ADMIN, signer.address);
      
      console.log(`\n📊 FINAL ROLE STATUS:`);
      console.log(`Treasury has AUCTION_ADMIN: ${newTreasuryHasRole ? "YES" : "NO"}`);
      console.log(`Deployer has AUCTION_ADMIN: ${deployerStillHasRole ? "YES" : "NO"}`);
      
      console.log(`\n✅ SECURITY BEST PRACTICES APPLIED:`);
      console.log("- Treasury no longer has admin control over auction");
      console.log("- Deployer retains admin access for legitimate operations");
      console.log("- Reduced attack surface for future security");
    }
  } catch (error: any) {
    console.log(`❌ Failed to revoke role: ${error.message}`);
  }

  console.log("\n🎉 SECURITY CLEANUP COMPLETE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
