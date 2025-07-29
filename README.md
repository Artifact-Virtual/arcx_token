## ARCx
> The Smarter Contract

![Live](https://img.shields.io/badge/Live-Live-0052FF?style=for-the-badge&logo=coinbase)

**Contract Address:** [`0xDa1d3752a2227FA2d2ad86Ba1D637d1d33D585ec`](https://basescan.org/address/0xDa1d3752a2227FA2d2ad86Ba1D637d1d33D585ec)

**Verification Status:** ✅ Verified on [BaseScan](https://basescan.org/address/0xDa1d3752a2227FA2d2ad86Ba1D637d1d33D585ec#code) and [Sourcify](https://repo.sourcify.dev/contracts/full_match/8453/0xDa1d3752a2227FA2d2ad86Ba1D637d1d33D585ec/)

**Deployment Details:**

- **Network:** Base Mainnet (Chain ID: 8453)
- **Deployed:** July 29, 2025
- **Block Number:** 33,511,728
- **Transaction Hash:** [`0x13ea418cf30bb88691de06a495838182df6a37b07a0cb3cdb089dce7dcd8a2f7`](https://basescan.org/tx/0x13ea418cf30bb88691de06a495838182df6a37b07a0cb3cdb089dce7dcd8a2f7)
- **Deployer:** `0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B`

### Token Specifications

- **Name:** ARCx
- **Symbol:** ARCx  
- **Decimals:** 18
- **Max Supply:** 100,000,000 ARCx
- **Current Supply:** 0 ARCx (minting not yet initiated)
- **Type:** ERC20 with AccessControl, Pausable, and Capped extensions

### Role Configuration

- **DEFAULT_ADMIN_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅
- **MINTER_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅
- **PAUSER_ROLE:** `0x21e914dfbb137f7fec896f11bc8bad6bccdb147b` ✅

### Contract Status

- **Paused:** No ✅
- **Minting Finalized:** No (ready for token distribution)
- **Bridge Configured:** Not yet (0x0000000000000000000000000000000000000000)
- **Total Supply:** 0 ARCx (awaiting initial mint)

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

- [Live Deployment](#-live-on-base-mainnet-)
- [Token Specifications](#token-specifications)
- [Role Configuration](#role-configuration)
- [Contract Status](#contract-status)
- [Overview](#overview)
- [Contract Interaction](#-contract-interaction)
- [Security Model](#security-model)
- [Architecture](#architecture)
- [Lifecycle Phases](#lifecycle-phases)
- [Token Distribution](#token-distribution)
- [Development Environment](#development-environment)
- [Getting Started](#getting-started)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Documentation](#documentation)
- [Project Status](#project-status)
- [License](#license)


---

## 🔗 Contract Interaction

### Adding ARCx to Your Wallet

**Network:** Base Mainnet
**Contract Address:** `0xDa1d3752a2227FA2d2ad86Ba1D637d1d33D585ec`
**Symbol:** ARCx
**Decimals:** 18

### Contract Functions

**Public Read Functions:**
- `name()` → "ARCx"
- `symbol()` → "ARCx" 
- `totalSupply()` → Current circulating supply
- `balanceOf(address)` → Token balance of address
- `cap()` → Maximum supply (100,000,000 ARCx)
- `paused()` → Contract pause status

**Admin Functions (Role Required):**
- `mint(address, amount)` → Mint tokens (MINTER_ROLE)
- `pause()` / `unpause()` → Emergency controls (PAUSER_ROLE)
- `finalizeMinting()` → Lock supply permanently (ADMIN_ROLE)
- `setFuelBridge(address)` → Set migration bridge (ADMIN_ROLE, one-time only)

**Migration Function:**
- `burnToFuel(uint256)` → Burn ARCx and migrate to FUEL (available after bridge is set)

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

| Category                 | Allocation | Description                                  |
| ------------------------ | ---------- | -------------------------------------------- |
| Core Development Fund    | 30%        | Protocol engineers and contributors          |
| Ecosystem Bootstrap      | 20%        | Validators, infrastructure, and tooling      |
| Community Round (Public) | 25%        | Public, fair-launch sale                     |
| Strategic Partners       | 15%        | Institutional partners and integrators       |
| ARCx Treasury Reserve    | 10%        | Future conversion or burn mechanisms         |

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

# Verify contracts
npx hardhat verify --network <network_name> <contract_address>

# Security audit
npm audit

# Generate gas report
REPORT_GAS=true npx hardhat test
```

---

## Testing & Quality Assurance

- **35 Comprehensive Tests:** Complete coverage including enhanced role management functions.
- **Unit Tests:** 100% coverage for all contract logic and administrative functions.
- **Integration Tests:** Simulate migration scenarios and multi-network deployments.
- **Role Management Tests:** Comprehensive testing of role transfer, renouncement, and emergency functions.
- **Gas Profiling:** Automated gas usage optimization and reporting.
- **Security Tests:** Fuzzing and invariant checks for critical functions.
- **Environment Validation:** Pre-deployment verification of configuration and network connectivity.

---

## Documentation

- [`docs/WHITEPAPER.md`](docs/WHITEPAPER.md): Protocol rationale, architecture, and migration details.
- [`docs/TokenSaleTerms.md`](docs/TokenSaleTerms.md): Sale and distribution terms.
- [`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md): Comprehensive environment configuration guide.
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
