// scripts/cleanup-redundant.ts
// Script to safely remove redundant scripts after consolidation

import * as fs from "fs";
import * as path from "path";

const SCRIPTS_TO_REMOVE = [
  // Status scripts - replaced by status.ts
  "quick_status.ts",
  "final_status.ts", 
  "deep_status.ts",
  "current_deployment_status.ts",
  "check_live_status.js",
  
  // Investigation scripts - functionality moved to status.ts
  "investigate_contract.ts",
  "investigate_minting.ts",
  "token_forensics.ts",
  
  // Deployment scripts - replaced by deploy.ts
  "deploy_dutch_auction.ts",
  "EMERGENCY_deploy_dutch_auction.ts", 
  "EMERGENCY_deploy_smart_airdrop.ts",
  
  // Liquidity scripts - replaced by liquidity.ts
  "add_v4_liquidity.ts",
  "provide_liquidity.ts",
  "create_v4_liquidity_pool.ts",
  "setup_uniswap_v4_pool.ts",
  "initialize_v4_pool.ts",
  "safe_lp_transaction.ts",
  "approve_lp_tokens.ts",
  
  // Specific check scripts - functionality moved to status.ts
  "check_auction_status.ts",
  "check_funding_status.ts", 
  "check_liquidity.ts",
  
  // Liquidity strategy scripts - replaced by liquidity.ts
  "enterprise_lp_strategy.ts",
  "verify_liquidity_ready.ts",
  
  // Auction management - functionality can be moved to status.ts
  "finalize_auction.ts",
  
  // Utility scripts that are now redundant
  "burn_excess_tokens.ts", // Rarely needed, can be recreated if needed
];

const SCRIPTS_TO_KEEP = [
  // Core deployment scripts
  "01_validate_deployment_readiness.ts", // Has complex validation logic
  "02_deploy_arcx.ts", // Core token deployment
  "03_deploy_vesting.ts", // Core vesting deployment
  
  // Orchestration scripts
  "98_orchestrate_full_deployment.ts", // Complex orchestration
  "99_orchestrate_lp_deployment.ts", // LP orchestration
  
  // New consolidated scripts
  "status.ts",
  "deploy.ts", 
  "liquidity.ts",
  
  // Shared utilities
  "shared/constants.ts",
  "shared/utils.ts",
];

async function main() {
  console.log("🧹 ARCx Scripts Cleanup");
  console.log("=======================");
  console.log("Removing redundant scripts after consolidation");
  
  const scriptsDir = path.join(__dirname);
  
  console.log("\n📋 Scripts to remove:");
  SCRIPTS_TO_REMOVE.forEach(script => {
    console.log(`❌ ${script}`);
  });
  
  console.log("\n📋 Scripts to keep:");
  SCRIPTS_TO_KEEP.forEach(script => {
    console.log(`✅ ${script}`);
  });
  
  // Check if running in dry-run mode
  const dryRun = process.argv.includes("--dry-run");
  console.log(`\n🧪 Dry Run: ${dryRun ? "ENABLED" : "DISABLED"}`);
  
  if (dryRun) {
    console.log("\n🧪 DRY RUN: Would remove the above files");
    return;
  }
  
  // Prompt for confirmation
  if (!process.argv.includes("--confirm")) {
    console.log("\n⚠️ This will permanently delete the redundant scripts.");
    console.log("Add --confirm to proceed or --dry-run to test.");
    return;
  }
  
  console.log("\n🚀 Proceeding with cleanup...");
  
  let removedCount = 0;
  let errorCount = 0;
  
  for (const scriptFile of SCRIPTS_TO_REMOVE) {
    const filePath = path.join(scriptsDir, scriptFile);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${scriptFile}`);
        removedCount++;
      } else {
        console.log(`⚠️ Not found: ${scriptFile}`);
      }
    } catch (error: any) {
      console.log(`❌ Error removing ${scriptFile}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log("\n📊 CLEANUP SUMMARY");
  console.log("==================");
  console.log(`✅ Removed: ${removedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`📁 Remaining: ${SCRIPTS_TO_KEEP.length} files`);
  
  if (errorCount === 0) {
    console.log("\n🎉 Cleanup completed successfully!");
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Update package.json scripts to use new consolidated scripts");
    console.log("2. Update documentation to reflect new script structure");
    console.log("3. Test the new consolidated scripts");
    console.log("\n💡 New Usage:");
    console.log("- Status: npx hardhat run scripts/status.ts --network base");
    console.log("- Deploy: npx hardhat run scripts/deploy.ts --network base auction");
    console.log("- Liquidity: npx hardhat run scripts/liquidity.ts --network base status");
  } else {
    console.log("\n⚠️ Cleanup completed with errors. Review the error messages above.");
  }
}

// Show consolidation benefits
function showBenefits() {
  console.log("\n🎯 CONSOLIDATION BENEFITS");
  console.log("=========================");
  console.log("✅ Reduced from 29 scripts to 8 core scripts");
  console.log("✅ Eliminated duplicate contract address definitions");
  console.log("✅ Centralized common utilities and constants");
  console.log("✅ Standardized error handling and validation");
  console.log("✅ Improved maintainability and consistency");
  console.log("✅ Reduced potential for configuration drift");
  console.log("✅ Simplified deployment and management workflows");
}

showBenefits();

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Usage:
// npx ts-node scripts/cleanup-redundant.ts --dry-run
// npx ts-node scripts/cleanup-redundant.ts --confirm
