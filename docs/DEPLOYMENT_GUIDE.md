# ARCx Vesting System - Enterprise Deployment Guide

## 🚀 Overview

This document provides comprehensive instructions for deploying the next-generation ARCx Master Vesting Contract with enterprise-grade security, auditability, and operational excellence.

## 🏗️ Architecture

The ARCx Vesting System consists of:

1. **ARCx_MVC.sol** - Master Vesting Contract with role-based access control
2. **Deployment Scripts** - Automated deployment with validation
3. **Token Transfer System** - Secure token allocation to vesting contract
4. **Schedule Orchestrator** - Intelligent vesting schedule configuration
5. **Master Orchestrator** - End-to-end deployment automation

## 🔐 Security Features

- ✅ **AccessControl** - Role-based permissions matching ARCxToken
- ✅ **ReentrancyGuard** - Protection against reentrancy attacks
- ✅ **Pausable** - Emergency pause functionality
- ✅ **SafeERC20** - Secure token transfer operations
- ✅ **Multisig Integration** - Treasury Safe compatibility
- ✅ **Comprehensive Auditing** - Full event logging and reporting

## 📋 Prerequisites

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### 2. Required Environment Variables
```bash
# Network Configuration
NETWORK_NAME=base
PRIVATE_KEY=your_deployer_private_key

# Contract Addresses
ARCX_TOKEN_ADDRESS=0xA4093669DAFbD123E37d52e0939b3aB3C2272f44
TREASURY_SAFE_ADDRESS=0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38

# Deployment Configuration
VESTING_START_DATE=2025-08-15
TRANSFER_AMOUNT=1000000  # Total ARCx tokens to transfer

# Safety Controls
DRY_RUN=true  # Set to false for actual deployment
CONFIRM_TRANSFER=false  # Set to true to confirm token transfers
SKIP_CONFIRMATION=false  # Set to true to skip manual confirmations
```

### 3. Pre-Deployment Checklist

- [ ] Treasury Safe multisig deployed: `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`
- [ ] ARCx tokens minted to deployer address
- [ ] Deployer has sufficient ETH for gas fees
- [ ] Network configuration verified (Base Mainnet)
- [ ] All placeholder addresses replaced with actual beneficiary addresses

## 🎯 Deployment Options

### Option 1: Complete Automated Deployment (Recommended)

Execute the master orchestration script for end-to-end deployment:

```bash
# Dry run first (STRONGLY RECOMMENDED)
DRY_RUN=true npx hardhat run scripts/orchestrate_full_deployment.ts --network base

# Review output, then proceed with actual deployment
DRY_RUN=false CONFIRM_TRANSFER=true npx hardhat run scripts/orchestrate_full_deployment.ts --network base
```

### Option 2: Manual Step-by-Step Deployment

#### Step 1: Deploy Vesting Contract
```bash
npx hardhat run scripts/deploy_vesting.ts --network base
```

#### Step 2: Transfer Tokens to Vesting Contract
```bash
# Set the vesting contract address from Step 1
export VESTING_CONTRACT_ADDRESS=0x...

# Transfer tokens (dry run first)
DRY_RUN=true npx hardhat run scripts/transfer_tokens_to_vesting.ts --network base

# Actual transfer
CONFIRM_TRANSFER=true npx hardhat run scripts/transfer_tokens_to_vesting.ts --network base
```

#### Step 3: Setup Vesting Schedules
```bash
# Configure schedules (dry run first)
DRY_RUN=true npx hardhat run scripts/setup_vesting_schedules.ts --network base

# Actual setup
CONFIRM_SCHEDULES=true npx hardhat run scripts/setup_vesting_schedules.ts --network base
```

## 📊 Allocation Summary

| Category | Allocation | Percentage | Vesting Terms |
|----------|------------|------------|---------------|
| Core Team | 200,000 ARCx | 20% | 6-12 month cliff, 18-36 month linear |
| Ecosystem Fund | 250,000 ARCx | 25% | 25% immediate, 75% over 1 year |
| Community Airdrop | 150,000 ARCx | 15% | Immediate or 3 month vesting |
| Strategic Partners | 100,000 ARCx | 10% | 6 month cliff, 12 month linear |
| Public Sale | 200,000 ARCx | 20% | Immediate unlock |
| Treasury Reserve | 100,000 ARCx | 10% | 2 year lock |

## 🔍 Validation & Verification

### Post-Deployment Validation
The scripts automatically perform comprehensive validation:

1. **Contract Verification** - Validate contract deployment and configuration
2. **Token Balance Verification** - Confirm token transfers completed
3. **Role Assignment Verification** - Validate multisig has admin roles
4. **Schedule Configuration Verification** - Confirm all vesting schedules
5. **Security Controls Verification** - Validate pause/emergency functions

### Manual Verification Commands
```bash
# Verify contract on BaseScan
npx hardhat verify --network base VESTING_CONTRACT_ADDRESS

# Check vesting contract token balance
npx hardhat console --network base
# > const contract = await ethers.getContractAt("ARCxToken", "TOKEN_ADDRESS")
# > await contract.balanceOf("VESTING_CONTRACT_ADDRESS")

# Verify multisig has admin role
# > const vesting = await ethers.getContractAt("ARCxMasterVesting", "VESTING_ADDRESS")
# > await vesting.hasRole(await vesting.ADMIN_ROLE(), "TREASURY_SAFE_ADDRESS")
```

## 🛡️ Security Best Practices

### Before Deployment
1. **Code Review** - Comprehensive review of all contracts and scripts
2. **Test Execution** - Run full test suite: `npm test`
3. **Dry Run** - Always execute dry runs before actual deployment
4. **Gas Estimation** - Validate gas requirements and network fees

### During Deployment
1. **Monitor Transactions** - Watch all transactions on BaseScan
2. **Validate Each Step** - Confirm each deployment phase completed successfully
3. **Save Transaction Hashes** - Record all deployment transaction hashes
4. **Backup Configuration** - Save all deployment parameters and addresses

### After Deployment
1. **Transfer Admin Rights** - Transfer admin roles to treasury multisig
2. **Pause Non-Critical Functions** - Consider pausing until operational
3. **Monitor Contract Activity** - Set up monitoring for vesting releases
4. **Documentation Update** - Update all documentation with final addresses

## 🚨 Emergency Procedures

### Emergency Pause
```solidity
// Via treasury multisig, call:
vestingContract.pause();
tokenContract.pause();
```

### Emergency Token Recovery
```solidity
// Via treasury multisig, call:
vestingContract.emergencyWithdraw(targetAddress, amount, "Emergency reason");
```

### Revoke Compromised Vesting
```solidity
// Via treasury multisig, call:
vestingContract.revokeVesting(compromisedAddress);
```

## 📁 Generated Reports

The deployment process generates comprehensive audit reports:

- **Deployment Report** - Complete deployment summary with all addresses
- **Transfer Audit Report** - Token transfer validation and balances
- **Schedule Configuration Report** - Vesting schedule setup summary
- **Security Validation Report** - Security controls and role assignments

Reports are saved to: `/reports/` directory

## 🔗 Contract Addresses

### Production Addresses (Base Mainnet)
- **ARCx Token**: `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`
- **Treasury Safe**: `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`
- **Vesting Contract**: `[TO BE DEPLOYED]`

### Testnet Addresses (Base Sepolia)
- Update after testnet deployment

## 🆘 Troubleshooting

### Common Issues

1. **Gas Estimation Fails**
   - Check network congestion
   - Increase gas price: `MAX_GAS_PRICE=100`

2. **Transaction Reverts**
   - Verify contract state (not paused)
   - Check role permissions
   - Validate token balances

3. **Deployment Validation Fails**
   - Verify network connection
   - Check contract addresses
   - Review environment variables

### Support Contacts
- **Technical Lead**: [Contact Information]
- **Security Team**: [Contact Information]
- **Emergency Response**: [Contact Information]

## ✅ Final Checklist

Before going live:

- [ ] All tests pass
- [ ] Dry run completed successfully
- [ ] Treasury multisig tested and verified
- [ ] Emergency procedures documented
- [ ] Monitoring systems configured
- [ ] Team notified of deployment schedule
- [ ] Backup plans in place

---

**⚠️ CRITICAL REMINDER**: Always execute dry runs and validate each step before proceeding with actual deployment. The ARCx ecosystem depends on the security and reliability of this vesting system.

**🚀 SUCCESS CRITERIA**: Deployment is considered successful when all tokens are securely allocated, vesting schedules are active, and treasury multisig has full administrative control.
