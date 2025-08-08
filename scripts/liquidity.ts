// scripts/liquidity.ts
// Consolidated liquidity management script
// Replaces: add_v4_liquidity.ts, provide_liquidity.ts, create_v4_liquidity_pool.ts, 
//           setup_uniswap_v4_pool.ts, initialize_v4_pool.ts, safe_lp_transaction.ts

import { ethers } from "hardhat";
import { CONTRACTS, POOL_CONFIG, AMOUNTS } from "./shared/constants";
import { 
  displayScriptHeader, 
  validateNetwork, 
  checkEthBalance, 
  checkTokenBalance,
  printValidationResults,
  safeContractCall 
} from "./shared/utils";

interface LiquidityOptions {
  action: "setup" | "add" | "remove" | "status";
  amount?: string;
  dryRun?: boolean;
}

async function main() {
  displayScriptHeader(
    "ARCx Uniswap V4 Liquidity Management",
    "Consolidated script for all V4 liquidity operations"
  );

  // Parse command line arguments
  const args = process.argv.slice(2);
  const action = args[0] as LiquidityOptions["action"] || "status";
  const dryRun = args.includes("--dry-run");

  console.log(`\n🎯 Action: ${action.toUpperCase()}`);
  console.log(`🧪 Dry Run: ${dryRun ? "ENABLED" : "DISABLED"}`);

  // Validation
  const validationResults = [];
  validationResults.push(await validateNetwork());

  const [signer] = await ethers.getSigners();
  console.log(`\n🔐 Signer: ${signer.address}`);

  if (action !== "status") {
    validationResults.push(await checkEthBalance(signer.address, "0.01"));
  }

  const { criticalIssues } = printValidationResults(validationResults);

  if (criticalIssues > 0 && !dryRun) {
    console.log("❌ Cannot proceed with critical issues. Use --dry-run to test.");
    return;
  }

  // Execute action
  switch (action) {
    case "setup":
      await setupPool(dryRun);
      break;
    case "add":
      await addLiquidity(dryRun);
      break;
    case "remove":
      await removeLiquidity(dryRun);
      break;
    case "status":
    default:
      await checkLiquidityStatus();
      break;
  }
}

async function checkLiquidityStatus() {
  console.log("\n🏊 LIQUIDITY STATUS CHECK");
  console.log("=========================");

  // Check Uniswap V4 contracts
  const v4Contracts = [
    { name: "Pool Manager", address: CONTRACTS.POOL_MANAGER },
    { name: "Position Manager", address: CONTRACTS.POSITION_MANAGER },
    { name: "Universal Router", address: CONTRACTS.UNIVERSAL_ROUTER },
  ];

  console.log("\n📍 Uniswap V4 Infrastructure:");
  for (const contract of v4Contracts) {
    const code = await ethers.provider.getCode(contract.address);
    const isDeployed = code !== "0x";
    console.log(`${isDeployed ? "✅" : "❌"} ${contract.name}: ${isDeployed ? "DEPLOYED" : "NOT DEPLOYED"}`);
  }

  // Check token balances for liquidity provision
  console.log("\n💰 Treasury Liquidity Readiness:");
  
  const treasuryEthBalance = await ethers.provider.getBalance(CONTRACTS.TREASURY_SAFE);
  console.log(`💎 Treasury ETH: ${ethers.formatEther(treasuryEthBalance)} ETH`);

  const tokenBalanceResult = await checkTokenBalance(
    CONTRACTS.ARCX_TOKEN,
    CONTRACTS.TREASURY_SAFE,
    AMOUNTS.LP_ARCX
  );

  if (tokenBalanceResult.status === "PASS") {
    console.log(`✅ Treasury ARCx: Sufficient for LP (${AMOUNTS.LP_ARCX} ARCx available)`);
  } else {
    console.log(`❌ Treasury ARCx: ${tokenBalanceResult.message}`);
  }

  // Pool configuration
  console.log("\n🏊 Pool Configuration:");
  console.log(`- Token0: ${CONTRACTS.ARCX_TOKEN < CONTRACTS.WETH_BASE ? CONTRACTS.ARCX_TOKEN : CONTRACTS.WETH_BASE}`);
  console.log(`- Token1: ${CONTRACTS.ARCX_TOKEN < CONTRACTS.WETH_BASE ? CONTRACTS.WETH_BASE : CONTRACTS.ARCX_TOKEN}`);
  console.log(`- Fee Tier: ${POOL_CONFIG.FEE / 100}% (${POOL_CONFIG.FEE} basis points)`);
  console.log(`- Tick Spacing: ${POOL_CONFIG.TICK_SPACING}`);
  console.log(`- Hooks: ${POOL_CONFIG.HOOKS === CONTRACTS.NULL_ADDRESS ? "None (Clean)" : POOL_CONFIG.HOOKS}`);

  console.log("\n💧 Planned Liquidity:");
  console.log(`- ARCx Amount: ${AMOUNTS.LP_ARCX} ARCx`);
  console.log(`- ETH Amount: ${AMOUNTS.LP_ETH} ETH`);
  console.log(`- Initial Price: 1 ARCx = ${AMOUNTS.INITIAL_PRICE_ETH} ETH`);
}

async function setupPool(dryRun: boolean) {
  console.log("\n🚀 POOL SETUP");
  console.log("=============");

  const poolKey = {
    currency0: CONTRACTS.ARCX_TOKEN < CONTRACTS.WETH_BASE ? CONTRACTS.ARCX_TOKEN : CONTRACTS.WETH_BASE,
    currency1: CONTRACTS.ARCX_TOKEN < CONTRACTS.WETH_BASE ? CONTRACTS.WETH_BASE : CONTRACTS.ARCX_TOKEN,
    fee: POOL_CONFIG.FEE,
    tickSpacing: POOL_CONFIG.TICK_SPACING,
    hooks: POOL_CONFIG.HOOKS,
  };

  console.log("🏊 Pool Key:");
  console.log(`- Currency0: ${poolKey.currency0}`);
  console.log(`- Currency1: ${poolKey.currency1}`);
  console.log(`- Fee: ${poolKey.fee}`);
  console.log(`- Tick Spacing: ${poolKey.tickSpacing}`);
  console.log(`- Hooks: ${poolKey.hooks}`);

  // Calculate sqrt price for initial price
  // For 1 ARCx = 0.0005 ETH
  const sqrtPriceX96 = "1771845812700903892492542091776"; // sqrt(0.0005) * 2^96

  console.log(`\n💰 Initial Price Setup:`);
  console.log(`- Target Price: 1 ARCx = ${AMOUNTS.INITIAL_PRICE_ETH} ETH`);
  console.log(`- SqrtPriceX96: ${sqrtPriceX96}`);

  // Prepare Safe-ready calldata for PoolManager.initialize
  const poolManagerIface = new ethers.Interface([
    "function initialize((address,address,uint24,int24,address), uint160)"
  ]);
  const initData = poolManagerIface.encodeFunctionData("initialize", [
    [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks],
    sqrtPriceX96
  ]);

  console.log("\n📋 SAFE TX: INITIALIZE POOL");
  console.log(`To:   ${CONTRACTS.POOL_MANAGER}`);
  console.log(`Value: 0`);
  console.log(`Data: ${initData}`);

  if (dryRun) {
    console.log("\n🧪 DRY RUN: Would initialize pool with above parameters");
    return;
  }

  console.log("\n⚠️ Execute the SAFE TX above to initialize the pool");
}

async function addLiquidity(dryRun: boolean) {
  console.log("\n💧 ADD LIQUIDITY");
  console.log("================");

  const liquidityAmounts = {
    arcx: ethers.parseEther(AMOUNTS.LP_ARCX),
    weth: ethers.parseEther(AMOUNTS.LP_ETH),
  };

  console.log("💰 Liquidity Amounts:");
  console.log(`- ARCx: ${ethers.formatEther(liquidityAmounts.arcx)} ARCx`);
  console.log(`- WETH: ${ethers.formatEther(liquidityAmounts.weth)} WETH`);

  console.log("\n📋 Required Safe Transactions:");

  // 0) Wrap ETH -> WETH via WETH.deposit()
  const wethIface = new ethers.Interface([
    "function deposit() payable",
    "function approve(address spender, uint256 amount) returns (bool)"
  ]);
  const wethDepositData = wethIface.encodeFunctionData("deposit", []);
  console.log("\n0. WRAP ETH TO WETH:");
  console.log(`   To: ${CONTRACTS.WETH_BASE}`);
  console.log(`   Value: ${liquidityAmounts.weth.toString()} wei`);
  console.log(`   Data: ${wethDepositData}`);

  // 1) WETH approval to Position Manager
  const wethApprovalData = wethIface.encodeFunctionData("approve", [
    CONTRACTS.POSITION_MANAGER,
    liquidityAmounts.weth
  ]);

  console.log("\n1. APPROVE WETH:");
  console.log(`   To: ${CONTRACTS.WETH_BASE}`);
  console.log(`   Value: 0`);
  console.log(`   Data: ${wethApprovalData}`);

  // 2) ARCx approval to Position Manager
  const arcxIface = new ethers.Interface([
    "function approve(address spender, uint256 amount) returns (bool)"
  ]);
  const arcxApprovalData = arcxIface.encodeFunctionData("approve", [
    CONTRACTS.POSITION_MANAGER,
    liquidityAmounts.arcx
  ]);

  console.log("\n2. APPROVE ARCx:");
  console.log(`   To: ${CONTRACTS.ARCX_TOKEN}`);
  console.log(`   Value: 0`);
  console.log(`   Data: ${arcxApprovalData}`);

  console.log("\n3. ADD LIQUIDITY POSITION:");
  console.log(`   To: ${CONTRACTS.POSITION_MANAGER}`);
  console.log(`   Value: 0`);
  console.log("   Note: Use Uniswap v4 Position Manager to mint position (SDK/UI). Approvals above must target the correct Position Manager address on Base.");

  if (dryRun) {
    console.log("\n🧪 DRY RUN: Would execute above transactions");
    return;
  }

  console.log("\n⚠️ Liquidity addition requires manual Safe execution of the transactions above");
}

async function removeLiquidity(dryRun: boolean) {
  console.log("\n🔥 REMOVE LIQUIDITY");
  console.log("==================");

  console.log("⚠️ Liquidity removal requires:");
  console.log("1. Position NFT token ID");
  console.log("2. V4 SDK integration");
  console.log("3. Safe transaction execution");

  if (dryRun) {
    console.log("\n🧪 DRY RUN: Would prepare liquidity removal");
    return;
  }

  console.log("\n📋 Manual steps needed:");
  console.log("1. Identify position NFT in Treasury Safe");
  console.log("2. Calculate liquidity amounts to remove");
  console.log("3. Execute position decrease/burn transaction");
}

// Usage examples:
// npx hardhat run scripts/liquidity.ts --network base status
// npx hardhat run scripts/liquidity.ts --network base setup --dry-run
// npx hardhat run scripts/liquidity.ts --network base add
// npx hardhat run scripts/liquidity.ts --network base remove

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
