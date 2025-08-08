# 🚀 ARCx Liquidity Setup - UPDATED EXECUTION STEPS
**Date**: August 6, 2025  
**Treasury Safe**: `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`
**Updated LP Amount**: ~$4 USD equivalent (0.0016 ETH at $2500/ETH)

## 📋 PRE-REQUIREMENTS CHECKLIST

### ✅ Current Status Verified:
- [x] Auction is LIVE and ACTIVE
- [x] ARCx Token deployed: `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`
- [x] Treasury Safe exists: `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`
- [ ] **Treasury has 0.0016 ETH** ❌ (Currently 0 ETH)
- [ ] **Treasury has 3.2 ARCx** ❌ (Need to verify/transfer)

### 🚨 IMMEDIATE ACTION REQUIRED:
**STEP 0: Fund the Treasury Safe**
1. Send **0.0016 ETH** to `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`
2. Transfer **3.2 ARCx** tokens to treasury (if not already there)

---

## 🎯 EXACT EXECUTION STEPS

### STEP 1: Convert ETH to WETH
**Platform**: safe.global  
**Network**: Base L2

**Transaction Details:**
- **To**: `0x4200000000000000000000000000000000000006` (Base WETH)
- **Value**: `0.0016 ETH` (1600000000000000 wei)
- **Function**: `deposit()`
- **Data**: `0xd0e30db0`
- **Gas Estimate**: ~30,000


### STEP 2: Approve ARCx Tokens
**Transaction Details:**
- **To**: `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44` (ARCx Token)
- **Value**: `0 ETH`
- **Function**: `approve(address spender, uint256 amount)`
- **Data**: `0x095ea7b30000000000000000000000007c5f5a4bfd8fd63184577525326123b519429bdc0000000000000000000000000000000000000000000000002b5e3af16b1880000`
- **Parameters**:
  - spender: `0x7c5f5a4bfd8fd63184577525326123b519429bdc` (Position Manager)
  - amount: `25000000000000000000000` (25,000 ARCx)
- **Gas Estimate**: ~50,000

### STEP 3: Approve WETH Tokens
**Transaction Details:**
- **To**: `0x4200000000000000000000000000000000000006` (Base WETH)
- **Value**: `0 ETH`
- **Function**: `approve(address spender, uint256 amount)`
- **Data**: `0x095ea7b30000000000000000000000007c5f5a4bfd8fd63184577525326123b519429bdc0000000000000000000000000000000000000000000000000005af3107a4000`
- **Parameters**:
  - spender: `0x7c5f5a4bfd8fd63184577525326123b519429bdc` (Position Manager)
  - amount: `1600000000000000` (0.0016 WETH)
- **Gas Estimate**: ~45,000


### STEP 4: Initialize Pool (if needed)
**Transaction Details:**
- **To**: `0x498581ff718922c3f8e6a244956af099b2652b2b` (Pool Manager)
- **Value**: `0 ETH`
- **Function**: `initialize(PoolKey memory key, uint160 sqrtPriceX96)`
- **Data**: `0x6276cbbe0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000a4093669dafbd123e37d52e0939b3ab3c2272f440000000000000000000000000000000000000000000000000000000000000bb80000000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000165d248133fbb39a00130d2200`
- **Parameters**:
  - currency0: `0x4200000000000000000000000000000000000006` (WETH)
  - currency1: `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44` (ARCx)
  - fee: `3000` (0.3%)
  - tickSpacing: `60`
  - hooks: `0x0000000000000000000000000000000000000000`
  - sqrtPriceX96: `1772141651224845906346855353142857142857142857142` (1 ARCx = 0.0005 ETH)
- **Gas Estimate**: ~300,000

### STEP 5: Add Liquidity Position
**⚠️ CRITICAL**: This step requires Uniswap V4 SDK integration or custom contract call

**Transaction Details:**
- **To**: `0x7c5f5a4bfd8fd63184577525326123b519429bdc` (Position Manager)
- **Value**: `0 ETH`
- **Function**: `mint(MintParams calldata params)`
- **Parameters**:
  - poolKey: Same as Step 4
  - tickLower: `-887220` (Full Range Min)
  - tickUpper: `887220` (Full Range Max)
  - amount0Desired: `12500000000000000000` (12.5 WETH)
  - amount1Desired: `25000000000000000000000` (25,000 ARCx)
  - amount0Min: `12375000000000000000` (12.375 WETH - 1% slippage)
  - amount1Min: `24750000000000000000000` (24,750 ARCx - 1% slippage)
  - recipient: `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38` (Treasury Safe)
  - deadline: `Current timestamp + 1800` (30 minutes)
- **Gas Estimate**: ~500,000

---

## 🎯 EXECUTION CHECKLIST

### Before Starting:
- [ ] Treasury has 12.5+ ETH
- [ ] Treasury has 25,000+ ARCx tokens
- [ ] Connected to safe.global on Base network
- [ ] Treasury Safe signers ready

### Execute in Order:
- [ ] Step 1: Convert ETH to WETH
- [ ] Step 2: Approve ARCx tokens
- [ ] Step 3: Approve WETH tokens
- [ ] Step 4: Initialize pool (check if needed first)
- [ ] Step 5: Add liquidity position

### Success Indicators:
- [ ] LP NFT appears in treasury Safe
- [ ] Pool shows on Uniswap interface
- [ ] ARCx/WETH trading pair is live
- [ ] Treasury owns the liquidity position

---

## 🚨 CRITICAL NOTES

1. **Execute Step 0 FIRST** - Treasury needs 0.0016 ETH before anything else
2. **Check if pool exists** before Step 4 - it might already be initialized
3. **Step 5 is complex** - may require custom transaction or V4 SDK
4. **All gas estimates** are for Base L2 (very low cost)
5. **LP NFT ownership** will be treasury Safe address

**Total Gas Estimate**: ~925,000 gas units
**Total Estimated Cost**: ~$1.85 USD in gas fees on Base L2
**Expected Time**: 15-30 minutes for all steps
