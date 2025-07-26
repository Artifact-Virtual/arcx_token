
# ARCx Token

## Overview

### Security-First Approach
- **Zero Vulnerabilities**: All dependencies verified with `npm audit` showing 0 security issues
- **Modern Hardhat Stack**: Uses latest @nomicfoundation toolbox for maximum security
- **Ethers v6**: Latest cryptographic libraries with enhanced security features
- **Comprehensive Testing**: Full test suite with chai matchers and network helpers

### Development Environment
- **Solidity 0.8.21**: Latest stable compiler with enhanced security features
- **TypeScript Support**: Full type safety throughout the development stack
- **Hardhat Ignition**: Modern deployment and verification system
- **Gas Optimization**: Integrated gas reporting and optimization tools
- **Code Coverage**: Solidity coverage reporting for comprehensive testing

### Dependencies Status
```bash
npm audit  # ✅ 0 vulnerabilities found
```

All critical cryptographic dependencies (elliptic, secp256k1, cookie) have been updated to secure versions with dependency overrides ensuring no vulnerable packages are included.

## Smart Contract Architecture

- Developed in Solidity 0.8.21 using OpenZeppelin security primitives.

- Implements `finalizeMinting()` to irreversibly lock supply.

- `setFuelBridge()` allows a one-time assignment of the migration bridge address.

- `burnToFuel()` enables ARCx holders to convert tokens to FUEL post-migration.

## Lifecycle Phases

1. **Genesis Phase**: ARCx is minted and distributed per allocation; funds foundational development.

2. **Development Phase**: Supports governance, validator onboarding, and tooling. No further issuance.

3. **Migration Phase**: ARCx holders may burn tokens via the FuelBridge to receive FUEL.al funding and provisioning token for The Arc Protocol, a sovereign blockchain layer designed to support constitutional intelligence. ARCx is a fixed-supply, time-bound digital asset, facilitating the initial development and deployment of The Arc ecosystem, and providing a migration path into the FUEL-based economic model.

## Key Features

- **Fixed Supply**: The total supply of ARCx is immutable and established at contract deployment. No further minting is possible after the initial allocation.

- **Burn-to-Migrate**: ARCx holders can convert their tokens to FUEL via a contract-enforced, one-way migration bridge during the migration phase.

- **Role-Based Access Control**: The contract implements strict roles (`ADMIN`, `MINTER`, `PAUSER`) with immutable logic for governance and operational security.

- **Emergency Controls**: Includes mechanisms for emergency pausing and comprehensive on-chain auditability.

- **ERC20 Compliance**: Fully compatible with wallets and DeFi applications.

## Token Distribution

| Category                 | Allocation | Description                                  |
| ------------------------ | ---------- | -------------------------------------------- |
| Core Development Fund    | 30%        | Protocol engineers and contributors          |
| Ecosystem Bootstrap      | 20%        | Validators, infrastructure, and tooling      |
| Community Round (Public) | 25%        | Public, fair-launch sale                     |
| Strategic Partners       | 15%        | Institutional partners and integrators       |
| ARCx Treasury Reserve    | 10%        | Future conversion or burn mechanisms         |

- **Token Symbol**: ARCx
- **Decimals**: 18
- **Deployment**: EVM-compatible (Arc L1 or Base L2)

## Smart Contract Architecture

- Developed in Solidity 0.8.21 using OpenZeppelin security primitives.

- Implements `finalizeMinting()` to irreversibly lock supply.

- `setFuelBridge()` allows a one-time assignment of the migration bridge address.

- `burnToFuel()` enables ARCx holders to convert tokens to FUEL post-migration.

## Lifecycle Phases

1. **Genesis Phase**: ARCx is minted and distributed per allocation; funds foundational development.

2. **Development Phase**: Supports governance, validator onboarding, and tooling. No further issuance.

3. **Migration Phase**: ARCx holders may burn tokens via the FuelBridge to receive FUEL.

4. **Legacy Phase**: ARCx contract becomes dormant; all activity transitions to FUEL.

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
git clone https://github.com/Artifact-Virtual/arcx_token.git
cd arcx_token
npm install
```

### Available Commands

```bash
# Compile contracts
npx hardhat compile

# Run comprehensive test suite
npx hardhat test

# Check test coverage
npx hardhat coverage

# Deploy to network
npx hardhat run scripts/deploy.ts --network <network_name>

# Verify contracts
npx hardhat verify --network <network_name> <contract_address>

# Security audit
npm audit
```

### Testing
The project includes comprehensive test coverage with:
- Unit tests for all contract functions
- Integration tests for migration scenarios  
- Gas usage optimization tests
- Security vulnerability tests

## Documentation

- See `docs/WHITEPAPER.md` for protocol rationale, design, and migration details.
- See `docs/TokenSaleTerms.md` for sale and distribution terms.
- See `audits/security-report.md` for comprehensive security audit results.

## Project Status

### Security Excellence
- **Zero Vulnerabilities**: All 574 dependencies verified secure
- **A+ Security Rating**: Maximum security standards achieved
- **Production Ready**: Approved for deployment with comprehensive audit

### Modern Development Stack
- **Hardhat v2.22.16**: Latest development framework
- **Ethers v6.15.0**: Modern Web3 library with enhanced security
- **TypeScript v5.7.2**: Full type safety across the codebase
- **Comprehensive Testing**: Unit, integration, and coverage testing

### Infrastructure Hardening
- **Dependency Overrides**: Forced secure versions for all vulnerable packages
- **Platform Optimization**: Linux-specific configurations for clean operation
- **Build System**: Modern toolchain with integrated security scanning

## License

MIT License. See `LICENSE` for details.

---

*ARCx initiates the protocol. FUEL sustains its evolution.*

