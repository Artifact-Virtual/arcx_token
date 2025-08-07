# ARCx Scripts - Consolidated Architecture

This directory contains the streamlined script architecture for the ARCx ecosystem, reducing redundancy and improving maintainability.

## 📋 Script Structure

### 🎯 Core Scripts (8 total)

#### **Status & Monitoring**
- **`status.ts`** - Comprehensive ecosystem status check
  - Replaces: `quick_status.ts`, `final_status.ts`, `deep_status.ts`, `current_deployment_status.ts`
  - Usage: `npx hardhat run scripts/status.ts --network base`

#### **Deployment Management**  
- **`deploy.ts`** - Consolidated component deployment
  - Replaces: `deploy_dutch_auction.ts`, `EMERGENCY_deploy_dutch_auction.ts`, `EMERGENCY_deploy_smart_airdrop.ts`
  - Usage: 
    - `npx hardhat run scripts/deploy.ts --network base auction`
    - `npx hardhat run scripts/deploy.ts --network base airdrop --dry-run`
    - `npx hardhat run scripts/deploy.ts --network base all`

#### **Liquidity Management**
- **`liquidity.ts`** - Complete V4 liquidity operations
  - Replaces: `add_v4_liquidity.ts`, `provide_liquidity.ts`, `create_v4_liquidity_pool.ts`, `setup_uniswap_v4_pool.ts`, `initialize_v4_pool.ts`, `safe_lp_transaction.ts`
  - Usage:
    - `npx hardhat run scripts/liquidity.ts --network base status`
    - `npx hardhat run scripts/liquidity.ts --network base setup --dry-run`
    - `npx hardhat run scripts/liquidity.ts --network base add`

#### **Core Deployment Scripts** (Kept as-is)
- **`01_validate_deployment_readiness.ts`** - Pre-deployment validation
- **`02_deploy_arcx.ts`** - ARCx token deployment
- **`03_deploy_vesting.ts`** - Vesting contract deployment

#### **Orchestration Scripts** (Kept as-is)
- **`98_orchestrate_full_deployment.ts`** - Full system deployment
- **`99_orchestrate_lp_deployment.ts`** - LP deployment orchestration

### 🔧 Shared Infrastructure

#### **`shared/constants.ts`**
Centralized contract addresses, amounts, and configuration:
```typescript
export const CONTRACTS = {
  ARCX_TOKEN: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
  DUTCH_AUCTION: "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836",
  // ... all addresses
}
```

#### **`shared/utils.ts`**
Common utilities and functions:
- Contract status checking
- Network validation  
- Balance verification
- Error handling
- Formatting helpers

## 🚀 Usage Examples

### Status Checking
```bash
# Complete ecosystem status
npx hardhat run scripts/status.ts --network base

# Quick contract verification
npx hardhat run scripts/status.ts --network base
```

### Deployment Operations
```bash
# Deploy auction only
npx hardhat run scripts/deploy.ts --network base auction

# Deploy airdrop with dry run
npx hardhat run scripts/deploy.ts --network base airdrop --dry-run

# Deploy all components
npx hardhat run scripts/deploy.ts --network base all --confirm
```

### Liquidity Management
```bash
# Check liquidity status
npx hardhat run scripts/liquidity.ts --network base status

# Setup new pool (dry run)
npx hardhat run scripts/liquidity.ts --network base setup --dry-run

# Add liquidity
npx hardhat run scripts/liquidity.ts --network base add
```

## 🧹 Migration from Old Scripts

### Removed Scripts (21 total)
The following redundant scripts have been consolidated:

**Status Scripts → `status.ts`:**
- `quick_status.ts`
- `final_status.ts` 
- `deep_status.ts`
- `current_deployment_status.ts`
- `check_live_status.js`
- `investigate_contract.ts`
- `investigate_minting.ts`
- `token_forensics.ts`
- `check_auction_status.ts`
- `check_funding_status.ts`
- `check_liquidity.ts`

**Deployment Scripts → `deploy.ts`:**
- `deploy_dutch_auction.ts`
- `EMERGENCY_deploy_dutch_auction.ts`
- `EMERGENCY_deploy_smart_airdrop.ts`

**Liquidity Scripts → `liquidity.ts`:**
- `add_v4_liquidity.ts`
- `provide_liquidity.ts`
- `create_v4_liquidity_pool.ts`
- `setup_uniswap_v4_pool.ts`
- `initialize_v4_pool.ts`
- `safe_lp_transaction.ts`
- `approve_lp_tokens.ts`
- `enterprise_lp_strategy.ts`
- `verify_liquidity_ready.ts`

**Other:**
- `finalize_auction.ts`
- `burn_excess_tokens.ts`

### Script Migration Guide

| Old Script | New Command |
|------------|-------------|
| `quick_status.ts` | `npx hardhat run scripts/status.ts --network base` |
| `deploy_dutch_auction.ts` | `npx hardhat run scripts/deploy.ts --network base auction` |
| `add_v4_liquidity.ts` | `npx hardhat run scripts/liquidity.ts --network base add` |
| `check_auction_status.ts` | `npx hardhat run scripts/status.ts --network base` |

## 🎯 Benefits of Consolidation

1. **Reduced Redundancy:** From 29 scripts to 8 core scripts (72% reduction)
2. **Centralized Configuration:** All addresses and constants in one place
3. **Consistent Error Handling:** Standardized validation and error patterns
4. **Improved Maintainability:** Easier to update and maintain
5. **Better Documentation:** Clear usage patterns and examples
6. **Reduced Configuration Drift:** Single source of truth for addresses
7. **Streamlined Workflows:** Logical grouping of related operations

## 🔒 Safety Features

- **Dry Run Mode:** Test operations without execution (`--dry-run`)
- **Network Validation:** Automatic Base mainnet verification
- **Balance Checking:** Pre-flight validation of sufficient funds
- **Error Handling:** Graceful failure with clear error messages
- **Confirmation Required:** Critical operations require explicit confirmation

## 📝 Development Notes

### Adding New Functionality
1. **Status checks:** Add to `status.ts`
2. **Deployments:** Add to `deploy.ts` 
3. **Liquidity ops:** Add to `liquidity.ts`
4. **New addresses:** Update `shared/constants.ts`
5. **Common functions:** Add to `shared/utils.ts`

### Testing
Always test with dry run mode first:
```bash
npx hardhat run scripts/deploy.ts --network base auction --dry-run
```

### Safety Checklist
- [ ] Network validation passes
- [ ] Sufficient balances confirmed  
- [ ] Dry run executed successfully
- [ ] Addresses verified in constants.ts
- [ ] Confirmation flags added for critical operations

## 🆘 Emergency Recovery

If you need any of the removed scripts:
1. Check git history: `git log --oneline --name-only`
2. Restore specific file: `git checkout <commit> -- scripts/<file>`
3. Or recreate functionality using the consolidated scripts

The new architecture maintains all functionality while significantly reducing complexity and maintenance overhead.
