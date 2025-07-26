# Audit Scope

**Contracts to Audit:**
- contracts/ARCxToken.sol

**Scope Details:**
- All Solidity source code, including constructor logic, modifiers, and role-based access control
- ERC20 compliance and custom migration/burn logic
- Pausable and emergency controls
- Minting finalization and bridge assignment mechanisms
- All external and internal function calls
- Event emissions and state variable initialization

**Exclusions:**
- Third-party OpenZeppelin contracts (reviewed for integration only)
- Off-chain scripts and front-end code
