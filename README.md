## ARCx
> The Smarter Contract

![Live](https://img.shields.io/badge/-Live-0052FF?style=for-the-badge&logo=https://cryptologos.cc/logos/base-base-logo.svg&logoColor=white)

**Contract Address:** [`0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`](https://basescan.org/address/0xA4093669DAFbD123E37d52e0939b3aB3C2272f44)

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
- **Max Supply:** 100,000,000 ARCx
- **Current Supply:** 1,000,000 ARCx (initial mint complete)
- **Type:** ERC20 with AccessControl, Pausable, and Capped extensions

#### Initial Mint

The first mint was executed as follows:

```js
ARCx.mint("0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B", ethers.parseEther("1000000"));
```

Transaction details:

- **From:** `0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B`
- **To (Contract):** `0xA4093669DAFbD123E37d52e0939b3aB3C2272f44`
- **Amount:** 1,000,000 ARCx
- **Transaction Hash:** [`0xe2f323f6bbcb1d01f756bc3d51c7a4ee97b0762aa52480df06e5dcb42b2ed2f3`](https://basescan.org/tx/0xe2f323f6bbcb1d01f756bc3d51c7a4ee97b0762aa52480df06e5dcb42b2ed2f3)
- **Gas Used:** 74,198
- **Chain ID:** 8453 (Base Mainnet)

### Role Configuration

- **DEFAULT_ADMIN_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅
- **MINTER_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅
- **PAUSER_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅

### Contract Status

- **Paused:** No ✅
- **Minting Finalized:** No (ready for token distribution)
**Contract Status:** ✅ LIVE  
**Vesting System:** 🚀 READY FOR DEPLOYMENT  
**Treasury Safe:** `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38`

### Overview

ARCx is a time-bound, non-inflationary ERC20 that bootstraps The Arc and Adam Protocol providing a one-way migration path to FUEL, the ARC's native asset. Built as **The Smarter Contract**, ARCx incorporates advanced role management, comprehensive security auditing, and intelligent deployment automation, representing the evolution of smart contracts into intelligent, self-governing systems designed for uncompromising security, seamless migration, and robust composability within the EVM ecosystem.

<!-- Badges -->
<p align="center">
    <a href="https://github.com/Artifact-Virtual/arcx_token"><img src="https://img.shields.io/badge/Tests-35%20passing-brightgreen?logo=github" alt="Tests Status"></a>
    <a href="https://github.com/Artifact-Virtual/arcx_token"><img src="https://img.shields.io/github/package-json/v/Artifact-Virtual/arcx_token?label=Version&logo=npm" alt="Version"></a>
    <a href="https://github.com/Artifact-Virtual/arcx_token/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Artifact-Virtual/arcx_token?label=License" alt="License"></a>
    <a href="https://hardhat.org/"><img src="https://img.shields.io/badge/Hardhat-v2.22.16-blue?logo=ethereum" alt="Hardhat"></a>
    <a href="https://www.npmjs.com/package/ethers"><img src="https://img.shields.io/badge/Ethers-v6.15.0-4e5d94?logo=ethereum" alt="Ethers"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-v5.7.2-3178c6?logo=typescript" alt="TypeScript"></a>
    <a href="https://soliditylang.org/"><img src="https://img.shields.io/badge/Solidity-0.8.21-black?logo=solidity" alt="Solidity"></a>
    <a href="#testing--quality-assurance"><img src="https://img.shields.io/badge/Coverage-100%25-brightgreen?logo=codecov" alt="Coverage"></a>
    <a href="#security-model"><img src="https://img.shields.io/badge/Security-0%20vulnerabilities-brightgreen?logo=shield" alt="Security"></a>
   
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
- **Role-Based Access:** ADMIN_ROLE, VESTING_MANAGER_ROLE, PAUSER_ROLE
- **Security Features:** AccessControl, ReentrancyGuard, Pausable, SafeERC20
- **Category Management:** Enum-based allocation tracking per distribution category
- **Emergency Controls:** Revocation, restoration, emergency withdrawal with audit trail
- **Treasury Integration:** Safe multisig compatibility with comprehensive governance

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

Deployed on Base for ultra-low transaction costs:
- **Standard Transfer:** ~$0.01 USD
- **Token Mint:** ~$0.02 USD
- **Bridge Migration:** ~$0.03 USD

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
- **Modern Hardhat Stack:** Built with Hardhat v2.22.16, Ethers v6.15.0, and TypeScript v5.7.2.
- **Enhanced Role Management:** Advanced administrative functions including role transfer, renouncement, and emergency revocation.
- **Environment Configuration:** Comprehensive environment variable management with 30+ configuration options.
- **Multi-Network Support:** Production-ready deployment to Mainnet, Sepolia, Base, and Polygon networks.
- **One-Way Migration:** `burnToFuel()` enables ARCx holders to migrate to FUEL via a contract-enforced bridge.
- **Single-Use Bridge Assignment:** `setFuelBridge()` can only be called once, ensuring migration integrity.
- **ERC20 Compliance:** Fully interoperable with wallets, DeFi protocols, and EVM tooling.

---

## Lifecycle Phases

1. **Genesis:** ARCx minted and distributed per allocation; funds protocol development.
2. **Development:** Supports governance, validator onboarding, and ecosystem tooling. No further issuance.
3. **Migration:** ARCx holders can burn tokens via the FuelBridge to receive FUEL.
4. **Legacy:** ARCx contract becomes dormant; all value and activity transition to FUEL.

---

## Token Distribution

| Category                 | Allocation | Vesting Schedule | Description                                  |
| ------------------------ | ---------- | ---------------- | -------------------------------------------- |
| Core Team & Developers   | 20%        | 6-36 month cliff/linear | Protocol engineers and contributors          |
| Ecosystem Fund           | 25%        | 25% immediate, 75% linear | Validators, infrastructure, and tooling      |
| Community & Airdrop      | 15%        | Immediate/3-month options | Community distribution and airdrops         |
| Strategic Partners       | 10%        | 6 month cliff, 12 month linear | Institutional partners and integrators       |
| Public Sale              | 20%        | Immediate unlock | Public, fair-launch sale                     |
| Treasury Reserve         | 10%        | 2 year lock | Future protocol operations and reserves      |

**Vesting Management:**
- **Contract:** ARCx Master Vesting Contract (ARCx_MVC.sol)
- **Treasury:** `0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38` (Safe Multisig)
- **Features:** Role-based access, emergency controls, category-based allocation tracking

- **Token Symbol:** ARCx
- **Decimals:** 18
- **Deployment:** EVM-compatible (Arc L1 or Base L2)

---

## Development Environment

- **Node.js 18+**
- **npm** or **yarn**
- **Git**

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

- **Security:** All 574 dependencies verified secure; zero known vulnerabilities.
- **Audit:** Comprehensive third-party audit completed; A+ security rating.
- **Production Ready:** Approved for mainnet deployment.
- **Modern Stack:** Hardhat, Ethers, TypeScript, and Solidity—all latest stable releases.
- **Infrastructure:** Linux-optimized build and deployment pipeline; enforced dependency overrides.

---

## License

MIT License. See [`LICENSE`](LICENSE) for details.

---

*ARCx initiates the protocol. FUEL sustains its evolution.*
