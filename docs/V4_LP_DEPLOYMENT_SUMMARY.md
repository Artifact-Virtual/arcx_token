# ARCx Uniswap V4 Deployment Summary

## COMPLETED TASKS
1. **Contracts Deployed & Funded**
   - Dutch Auction: 100,000 ARCx
   - Smart Airdrop: 50,000 ARCx
   - Website Status: "Live"
   - Auction Timer: Active (17 minutes remaining)

## UNISWAP V4 LP SETUP - NEXT ACTIONS

### Step 1: Initialize Pool
Execute this transaction via Treasury Safe (`0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`):

**TRANSACTION: Initialize ARCx/WETH V4 Pool**
- **To**: `0x498581ff718922c3f8e6a244956af099b2652b2b` (PoolManager)
- **Value**: `0`
- **Data**: `0x6276cbbe0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000a40936699dafbd123e37d52e0939b3ab3c2272f440000000000000000000000000000000000000000000000000000000000000bb80000000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000165d248133fbb39a00130d2200`

**Pool Details**:
- Currency0: WETH (`0x4200000000000000000000000000000000000006`)
- Currency1: ARCx (`0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`)
- Fee: 0.3% (3000)
- Initial Price: 1 ARCx = 0.0005 ETH
- Pool ID: `0x15693609e79c4c98387248b6cd07c0295e02e7f04deb6c2fe73dcd708d867f46`

### Step 2: Fund Treasury with Liquidity Tokens
Transfer to Treasury Safe (`0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`):
- **12.5 WETH** - Need to acquire and transfer
- **25,000 ARCx** - Available in treasury (has 300K total)

### Step 3: Approve Tokens for Liquidity
Execute via Treasury Safe:

**TRANSACTION: Approve WETH**
- **To**: `0x4200000000000000000000000000000000000006`
- **Value**: `0`
- **Data**: `0x095ea7b30000000000000000000000007c5f5a4bfd8fd63184577525326123b519429bdc0000000000000000000000000000000000000000000000000ad78ebc5ac620000`

**TRANSACTION: Approve ARCx**
- **To**: `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`
- **Value**: `0`
- **Data**: `0x095ea7b30000000000000000000000007c5f5a4bfd8fd63184577525326123b519429bdc0000000000000000000000000000000000000000000054b40b1f852bda00000`

### Step 4: Add Liquidity Position
This requires V4 SDK integration for proper position management.

## Key Addresses
- **Treasury Safe**: `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`
- **ARCx Token**: `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`
- **WETH Base**: `0x4200000000000000000000000000000000000006`
- **Pool Manager**: `0x498581ff718922c3f8e6a244956af099b2652b2b`
- **Position Manager**: `0x7c5f5a4bfd8fd63184577525326123b519429bdc`
- **Universal Router**: `0x6ff5693b99212da76ad316178a184ab56d299b43`

## CRITICAL TIMING
- **Auction Goes Live**: 17 minutes remaining
- **Fair Distribution**: 72-hour window active
- **LP Setup**: Execute after auction launch

## IMMEDIATE PRIORITY
1. Contracts funded and ready
2. Initialize V4 Pool (execute Safe transaction above)
3. Acquire $4 USD worth of ETH (≈0.0016 ETH) for liquidity
4. Add initial liquidity position

**Status**: Ready for V4 LP deployment with reduced ETH requirement!
