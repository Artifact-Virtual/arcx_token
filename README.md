## ARCx
> The Smarter Contract

![Live](https://img.shields.io/badge/-Live-0052FF?style=for-the-badge&logo=https://cryptologos.cc/logos/base-base-logo.svg&logoColor=white) ![Fair Economy](https://img.shields.io/badge/-Fair%20Economy-00D2FF?style=for-the-badge)

**Token Contract:** [`0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`](https://basescan.org/address/0xA4093669DAFbD123E37d52e0939b3aB3C2272f44)

**Distribution System:**
- **Dutch Auction:** [`0xD788D9ac56c754cb927771eBf058966bA8aB734D`](https://basescan.org/address/0xD788D9ac56c754cb927771eBf058966bA8aB734D)
- **Smart Airdrop:** [`0x79166AbC8c17017436263BcE5f76DaB1c3dEa195`](https://basescan.org/address/0x79166AbC8c17017436263BcE5f76DaB1c3dEa195)

**Verification Status:** ✅ Verified on [BaseScan](https://basescan.org/address/0xA4093669DAFbD123E37d52e0939b3aB3C2272f44#code) and [Sourcify](https://repo.sourcify.dev/contracts/full_match/8453/0xA4093669DAFbD123E37d52e0939b3aB3C2272f44/)

**Deployment Details:**

- **Network:** Base Mainnet (Chain ID: 8453)
- **Deployed:** July 30, 2025
- **Block Number:** 33,538,106
- **Transaction Hash:** [`0x2e18fe324150c61cabfbf27524129bdeb0d02f007460f77c1a5716c77bed93aa`](https://basescan.org/tx/0x2e18fe324150c61cabfbf27524129bdeb0d02f007460f77c1a5716c77bed93aa)
- **Deployer:** `0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B`

### Token Specifications

- **Name:** ARCx
- **Symbol:** ARCx  
- **Decimals:** 18
- **Max Supply:** 1,000,000 ARCx (Fixed Supply)
- **Current Supply:** 1,000,000 ARCx (initial mint complete)
- **Type:** ERC20 with AccessControl, Pausable, and Capped extensions

#### Initial Mint

The complete token supply was minted upon deployment:

```js
ARCx.mint("0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B", ethers.parseEther("1000000"));
```

Transaction details:

- **From:** `0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B`
- **To (Contract):** `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`
- **Amount:** 1,000,000 ARCx (Complete Supply)
- **Transaction Hash:** [`0xe2f323f6bbcb1d01f756bc3d51c7a4ee97b0762aa52480df06e5dcb42b2ed2f3`](https://basescan.org/tx/0xe2f323f6bbcb1d01f756bc3d51c7a4ee97b0762aa52480df06e5dcb42b2ed2f3)
- **Gas Used:** 74,198
- **Chain ID:** 8453 (Base Mainnet)

### Role Configuration

- **DEFAULT_ADMIN_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅
- **MINTER_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅
- **PAUSER_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅

### Fair Distribution System

**Dutch Auction** - *100,000 ARCx*
- **Contract Address:** [`0xD788D9ac56c754cb927771eBf058966bA8aB734D`](https://basescan.org/address/0xD788D9ac56c754cb927771eBf058966bA8aB734D)
- **Price Discovery:** Dynamic pricing from $0.20 to $0.05 over 72 hours
- **Anti-Whale Protection:** 15% discount for smaller purchases
- **Early Supporter Bonuses:** Tier-based contribution rewards

**Smart Airdrop** - *50,000 ARCx*  
- **Contract Address:** [`0x79166AbC8c17017436263BcE5f76DaB1c3dEa195`](https://basescan.org/address/0x79166AbC8c17017436263BcE5f76DaB1c3dEa195)
- **Merit-Based Distribution:** Seven contribution categories with weighted rewards
- **Anti-Sybil Protection:** Account age and contribution verification
- **Claim Period:** 30 days from deployment

### Contract Status

- **Paused:** No ✅
- **Minting Finalized:** No (ready for final supply lock)
- **Contract Status:** ✅ LIVE  
- **Vesting System:** ✅ **FULLY OPERATIONAL**
- **Treasury Safe:** `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`
- **MVC Contract:** ✅ **LIVE** - `0xEEc0298bE76C9C3224eA05a34687C1a1134d550B`
- **Core Team Vesting:** ✅ **ACTIVE** - 200,000 ARCx (12mo cliff, 36mo total)
- **Ecosystem Vesting:** ✅ **ACTIVE** - 200,000 ARCx (6mo cliff, 24mo total)
- **Reserve Fund:** ✅ **ALLOCATED** - 100,000 ARCx
- **Treasury Control:** ✅ **OPERATIONAL** - 300,000 ARCx remaining

### Overview

ARCx is a funding instrument that bootstraps the Arc Protocol development and constitutional engine deployment. Built as a fixed-supply ERC20, ARCx provides essential funding to develop governance systems that embed constitutional principles directly into code, ensuring transparent, predictable operations that preserve human agency in an AI-driven future.

<!-- Badges -->
<p align="center">
    <a href="https://github.com/Artifact-Virtual/arcx_token"><img src="https://img.shields.io/badge/Tests-35%20passing-brightgreen?logo=github" alt="Tests Status"></a>
    <a href="https://github.com/Artifact-Virtual/arcx_token"><img src="https://img.shields.io/github/package-json/v/Artifact-Virtual/arcx_token?label=Version&logo=npm" alt="Version"></a>
    <a href="https://github.com/Artifact-Virtual/arcx_token/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Artifact-Virtual/arcx_token?label=License" alt="License"></a>
    <a href="https://hardhat.org/"><img src="https://img.shields.io/badge/Hardhat-v2.26.1-blue?logo=ethereum" alt="Hardhat"></a>
    <a href="https://www.npmjs.com/package/ethers"><img src="https://img.shields.io/badge/Ethers-v6.15.0-4e5d94?logo=ethereum" alt="Ethers"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-v5.9.2-3178c6?logo=typescript" alt="TypeScript"></a>
    <a href="https://soliditylang.org/"><img src="https://img.shields.io/badge/Solidity-0.8.21-black?logo=solidity" alt="Solidity"></a>
    <a href="#testing--quality-assurance"><img src="https://img.shields.io/badge/Coverage-100%25-brightgreen?logo=codecov" alt="Coverage"></a>
    <a href="#security-model"><img src="https://img.shields.io/badge/Security-0%20vulnerabilities-brightgreen?logo=shield" alt="Security"></a>
    <a href="#development-environment"><img src="https://img.shields.io/badge/Packages-568-blue?logo=npm" alt="Packages"></a>
</p>

---

## Table of Contents

- [ARCx](#arcx)
  - [Token Specifications](#token-specifications)
    - [Initial Mint](#initial-mint)
  - [Role Configuration](#role-configuration)
  - [Contract Status](#contract-status)
  - [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [🔗 Contract Interaction](#-contract-interaction)
  - [Adding ARCx to Your Wallet](#adding-arcx-to-your-wallet)
  - [Contract Functions](#contract-functions)
  - [Vesting System](#vesting-system)
    - [Example Mint Transaction](#example-mint-transaction)
  - [Gas Optimization](#gas-optimization)
- [Security Model](#security-model)
- [Architecture](#architecture)
- [Lifecycle Phases](#lifecycle-phases)
- [Token Distribution](#token-distribution)
- [Development Environment](#development-environment)
- [Getting Started](#getting-started)
  - [Common Commands](#common-commands)
- [Testing \& Quality Assurance](#testing--quality-assurance)
- [Documentation](#documentation)
- [Project Status](#project-status)
- [License](#license)

---

## 🔗 Contract Interaction

### Adding ARCx to Your Wallet

**Network:** Base Mainnet  
**Contract Address:** `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`  
**Symbol:** ARCx  
**Decimals:** 18

### Contract Functions

**Public Read Functions:**
- `name()` → "ARCx"
- `symbol()` → "ARCx" 
- `totalSupply()` → Current circulating supply
- `balanceOf(address)` → Token balance of address
- `MAX_SUPPLY()` → Maximum supply (100,000,000 ARCx)
- `paused()` → Contract pause status

**Admin Functions (Role Required):**
- `mint(address, amount)` → Mint tokens (MINTER_ROLE)
- `pause()` / `unpause()` → Emergency controls (PAUSER_ROLE)
- `finalizeMinting()` → Lock supply permanently (ADMIN_ROLE)
- `setFuelBridge(address)` → Set migration bridge (ADMIN_ROLE, one-time only)

**Migration Function:**
- `burnToFuel(uint256)` → Burn ARCx and migrate to FUEL (available after bridge is set)

### Vesting System

**Master Vesting Contract (ARCx_MVC.sol):**
- **Contract Address:** [`0xEEc0298bE76C9C3224eA05a34687C1a1134d550B`](https://basescan.org/address/0xEEc0298bE76C9C3224eA05a34687C1a1134d550B)
- **Verification Status:** ✅ Verified on [BaseScan](https://basescan.org/address/0xEEc0298bE76C9C3224eA05a34687C1a1134d550B#code) and [Sourcify](https://repo.sourcify.dev/contracts/full_match/8453/0xEEc0298bE76C9C3224eA05a34687C1a1134d550B)
- **Deployed:** August 3, 2025
- **Block Number:** 33,724,124
- **Transaction:** [`0x686ef0a5138cd3869070f91d3145b279bf03d8044845d432468bfddb840b0911`](https://basescan.org/tx/0x686ef0a5138cd3869070f91d3145b279bf03d8044845d432468bfddb840b0911)
- **Role-Based Access:** ADMIN_ROLE, VESTING_MANAGER_ROLE, PAUSER_ROLE
- **Security Features:** AccessControl, ReentrancyGuard, Pausable, SafeERC20
- **Category Management:** Enum-based allocation tracking per distribution category
- **Emergency Controls:** Revocation, restoration, emergency withdrawal with audit trail
- **Treasury Integration:** Safe multisig compatibility with comprehensive governance
- **Gas Optimization:** Sub-cent transaction costs on Base L2

**Vesting Functions:**
- `addVesting(beneficiary, amount, cliff, duration, category)` → Create vesting schedule
- `release(beneficiary)` → Release vested tokens
- `revokeVesting(beneficiary)` → Emergency revocation (admin only)
- `releasable(beneficiary)` → Query available tokens for release
- `getVesting(beneficiary)` → Get complete vesting details

#### Example Mint Transaction

The following Hardhat/ethers.js call was used for the initial mint:

```js
ARCx.mint("0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B", ethers.parseEther("1000000"));
```

Transaction response:

```js
ContractTransactionResponse {
  blockNumber: null,
  blockHash: null,
  hash: '0xe2f323f6bbcb1d01f756bc3d51c7a4ee97b0762aa52480df06e5dcb42b2ed2f3',
  from: '0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B',
  to: '0xA4093669DAFbD123E37d52e0939b3aB3C2272f44',
  nonce: 11,
  gasLimit: 74198n,
  gasPrice: 50000000n,
  data: '0x40c10f1900000000000000000000000021e914dfbb137f7fec896f11bc8bad6bccdb147b00000000000000000000000000000000000000000000d3c21bcecceda1000000',
  value: 0n,
  chainId: 8453n,
  ...
}
```

### Gas Optimization

Deployed on Base for ultra-low transaction costs with **sub-cent gas optimization**:

- **Standard Transfer:** ~$0.001 USD (sub-cent achieved ✅)
- **Token Mint:** ~$0.002 USD (sub-cent achieved ✅)
- **Bridge Migration:** ~$0.003 USD (sub-cent achieved ✅)  
- **Vesting Operations:** ~$0.001 USD (sub-cent achieved ✅)
- **Gas Price:** 0.01 gwei (minimum possible for Base L2)

**Project Goal Achievement:** ✅ **Sub-cent transactions delivered**

---

## Security Model

- **Zero Vulnerabilities:** All dependencies are continuously audited (`npm audit` reports 0 issues).
- **OpenZeppelin Primitives:** Built atop industry-standard, battle-tested security libraries.
- **Immutable Supply:** `finalizeMinting()` irreversibly locks the token supply.
- **Role-Based Access:** Strict, immutable roles (`ADMIN`, `MINTER`, `PAUSER`) enforce governance and operational controls.
- **Emergency Controls:** On-chain pausing and auditability for rapid incident response.
- **Comprehensive Testing:** Full suite of unit, integration, and security tests with coverage reporting.
- **Dependency Hardening:** All cryptographic dependencies (elliptic, secp256k1, cookie) are locked to secure versions via overrides.

---

## Architecture

- **Solidity 0.8.21:** Leveraging the latest stable compiler for enhanced safety.
- **Modern Hardhat Stack:** Built with Hardhat v2.26.1, Ethers v6.15.0, and TypeScript v5.9.2.
- **Enhanced Toolbox:** @nomicfoundation/hardhat-toolbox v6.1.0 with latest features.
- **Advanced Gas Reporting:** hardhat-gas-reporter v2.3.0 for comprehensive gas analysis.
- **Enhanced Role Management:** Advanced administrative functions including role transfer, renouncement, and emergency revocation.
- **Environment Configuration:** Comprehensive environment variable management with 40+ configuration options.
- **Multi-Network Support:** Production-ready deployment to Mainnet, Sepolia, Base, and Polygon networks.
- **One-Way Migration:** `burnToFuel()` enables ARCx holders to migrate to FUEL via a contract-enforced bridge.
- **Single-Use Bridge Assignment:** `setFuelBridge()` can only be called once, ensuring migration integrity.
- **ERC20 Compliance:** Fully interoperable with wallets, DeFi protocols, and EVM tooling.
- **Package Management:** 568 optimized dependencies with zero vulnerabilities.

---

## Lifecycle Phases

1. **Genesis:** ARCx minted and distributed per allocation; funds protocol development.
2. **Development:** Supports governance, validator onboarding, and ecosystem tooling. No further issuance.
3. **Migration:** ARCx holders can burn tokens via the FuelBridge to receive FUEL.
4. **Legacy:** ARCx contract becomes dormant; all value and activity transition to FUEL.

---

## Token Distribution

**🎯 FINAL ALLOCATION STATUS - FULLY DEPLOYED ON BASE ✅**

| Category                 | Allocation | Amount | Status | Vesting Schedule |
| ------------------------ | ---------- | ------ | ------ | --------------- |
| Core Team & Developers   | 20%        | 200,000 ARCx | ✅ **ACTIVE** | 12mo cliff, 36mo linear |
| Ecosystem Fund           | 20%        | 200,000 ARCx | ✅ **ACTIVE** | 6mo cliff, 24mo linear |
| Reserve Fund             | 10%        | 100,000 ARCx | ✅ **ALLOCATED** | Treasury controlled |
| Treasury Operations      | 30%        | 300,000 ARCx | ✅ **OPERATIONAL** | Multisig controlled |
| **TOTAL DEPLOYED**       | **80%**    | **800,000 ARCx** | ✅ **LIVE** | **Fully operational** |

**📍 Contract Addresses:**
- **ARCx Token:** [`0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`](https://basescan.org/address/0xA4093669DAFbD123E37d52e0939b3aB3C2272f44)
- **MVC Contract:** [`0xEEc0298bE76C9C3224eA05a34687C1a1134d550B`](https://basescan.org/address/0xEEc0298bE76C9C3224eA05a34687C1a1134d550B)
- **Treasury Safe:** [`0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`](https://basescan.org/safe/base:0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38)
- **Ecosystem Safe:** [`0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb`](https://basescan.org/safe/base:0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb)

**🔒 Vesting Details:**
- **Core Team:** 200,000 ARCx → Treasury Safe (12mo cliff, 36mo total duration)
- **Ecosystem:** 200,000 ARCx → Ecosystem Safe (6mo cliff, 24mo total duration)
- **Both vestings:** Start August 15, 2025 00:00:00 UTC
- **Security:** Role-based access, emergency controls, category-based allocation tracking

- **Token Symbol:** ARCx
- **Decimals:** 18
- **Deployment:** EVM-compatible (Arc L1 or Base L2)

---

## Development Environment

**Requirements:**
- **Node.js 18+** 
- **npm** or **yarn**
- **Git**

**Package Status:**
- **Total Packages:** 568 (optimized from 586)
- **Security Vulnerabilities:** 0 ✅
- **Latest Updates Applied:** August 2025
- **Key Dependencies:**
  - Hardhat v2.26.1 (latest)
  - @nomicfoundation/hardhat-toolbox v6.1.0 (latest)
  - hardhat-gas-reporter v2.3.0 (latest)
  - dotenv v17.2.1 (latest)
  - @types/node v24.1.0 (latest)
  - OpenZeppelin Contracts v4.9.6 (stable, security-audited)

---

## Getting Started

```bash
git clone https://github.com/Artifact-Virtual/arcx_token.git
cd arcx_token
npm install
```

### Common Commands

```bash
# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Compile contracts
npx hardhat compile

# Run all tests (35 comprehensive test cases)
npx hardhat test

# Check coverage
npx hardhat coverage

# Deploy to a network
npx hardhat run scripts/deploy_arcx.ts --network <network_name>

# Deploy vesting system
npx hardhat run scripts/deploy_vesting.ts --network <network_name>

# Transfer tokens to vesting (with confirmation)
CONFIRM_TRANSFER=true npx hardhat run scripts/transfer_tokens_to_vesting.ts --network <network_name>

# Setup vesting schedules
CONFIRM_SCHEDULES=true npx hardhat run scripts/setup_vesting_schedules.ts --network <network_name>

# Master deployment orchestration (dry run first)
DRY_RUN=true npx hardhat run scripts/orchestrate_full_deployment.ts --network <network_name>

# Verify contracts
npx hardhat verify --network <network_name> <contract_address>

# Security audit
npm audit

# Generate gas report
REPORT_GAS=true npx hardhat test
```

---

## Testing & Quality Assurance

- **35+ Comprehensive Tests:** Complete coverage including enhanced role management and vesting functions.
- **Unit Tests:** 100% coverage for all contract logic, administrative functions, and vesting mechanics.
- **Integration Tests:** Simulate migration scenarios, multi-network deployments, and vesting workflows.
- **Vesting Tests:** Comprehensive testing of schedule creation, token release, revocation, and emergency controls.
- **Role Management Tests:** Complete testing of role transfer, renouncement, and emergency functions.
- **Gas Profiling:** Automated gas usage optimization and reporting.
- **Security Tests:** Fuzzing and invariant checks for critical functions including vesting logic.
- **Environment Validation:** Pre-deployment verification of configuration and network connectivity.

---

## Documentation

- [`docs/WHITEPAPER.md`](docs/WHITEPAPER.md): Protocol rationale, architecture, and migration details.
- [`docs/TokenSaleTerms.md`](docs/TokenSaleTerms.md): Sale and distribution terms.
- [`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md): Comprehensive environment configuration guide.
- [`VESTING_SUMMARY.md`](VESTING_SUMMARY.md): Master vesting contract implementation summary.
- [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md): Enterprise deployment guide for vesting system.
- [`DEPLOYMENT_STATUS.md`](DEPLOYMENT_STATUS.md): Current deployment status and execution checklist.
- [`audits/security-report.md`](audits/security-report.md): Comprehensive security audit results.

---

## Project Status

**🎉 DEPLOYMENT COMPLETE - ARCx ECOSYSTEM FULLY OPERATIONAL ON BASE ✅**

- **ARCx Token:** ✅ DEPLOYED & VERIFIED (Base Mainnet)
- **MVC Vesting:** ✅ DEPLOYED & VERIFIED (Base Mainnet)  
- **Token Distribution:** ✅ COMPLETE - All 800K ARCx allocated and operational
- **Core Team Vesting:** ✅ ACTIVE (200K ARCx, 12mo cliff, 36mo linear)
- **Ecosystem Vesting:** ✅ ACTIVE (200K ARCx, 6mo cliff, 24mo linear)
- **Reserve Fund:** ✅ ALLOCATED (100K ARCx for future operations)
- **Treasury Operations:** ✅ OPERATIONAL (300K ARCx multisig controlled)
- **Gas Optimization:** ✅ SUB-CENT transactions on Base L2
- **Security:** ✅ Zero vulnerabilities, fully audited contracts

**📋 Final Deployment Summary:**

- **ARCx Token:** [`0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`](https://basescan.org/address/0xA4093669DAFbD123E37d52e0939b3aB3C2272f44) ✅
- **MVC Contract:** [`0xEEc0298bE76C9C3224eA05a34687C1a1134d550B`](https://basescan.org/address/0xEEc0298bE76C9C3224eA05a34687C1a1134d550B) ✅  
- **Treasury Safe:** [`0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`](https://basescan.org/safe/base:0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38) ✅
- **Ecosystem Safe:** [`0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb`](https://basescan.org/safe/base:0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb) ✅

**🔒 Active Vesting Schedules:**

**Core Team Vesting (Treasury Safe):**
- **Amount:** 200,000 ARCx
- **Start:** August 15, 2025 00:00:00 UTC
- **Cliff:** 12 months (unlocks August 15, 2026)  
- **Duration:** 36 months linear vesting
- **Monthly Release:** ~5,556 ARCx after cliff

**Ecosystem Bootstrap Vesting (Ecosystem Safe):**
- **Amount:** 200,000 ARCx
- **Start:** August 15, 2025 00:00:00 UTC
- **Cliff:** 6 months (unlocks February 15, 2026)
- **Duration:** 24 months linear vesting  
- **Monthly Release:** ~10,959 ARCx after cliff

**💰 Current Token Distribution:**
- **Core Team Vesting:** 200,000 ARCx (locked in MVC)
- **Ecosystem Vesting:** 200,000 ARCx (locked in MVC) 
- **Reserve Fund:** 100,000 ARCx (allocated)
- **Treasury Operations:** 300,000 ARCx (multisig controlled)
- **Future Allocation:** 200,000 ARCx (unallocated)
- **TOTAL:** 1,000,000 ARCx (100% accounted for)

---

## License

MIT License. See [`LICENSE`](LICENSE) for details.

---

*ARCx initiates the protocol. FUEL sustains its evolution.*
