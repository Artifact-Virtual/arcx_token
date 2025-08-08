// scripts/shared/constants.ts
// Centralized constants for ARCx ecosystem to eliminate redundancy

// Core ARCx Contract Addresses (Base Mainnet)
export const CONTRACTS = {
  // Core Ecosystem
  ARCX_TOKEN: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
  DUTCH_AUCTION: "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836",
  SMART_AIRDROP: "0x79166AbC8c17017436263BcE5f76DaB1c3dEa195",
  MASTER_VESTING: "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B",
  
  // Treasury & Safes
  TREASURY_SAFE: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
  ECOSYSTEM_SAFE: "0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb",
  
  // Uniswap V4 Infrastructure (Base)
  POOL_MANAGER: "0x498581ff718922c3f8e6a244956af099b2652b2b",
  POSITION_MANAGER: "0x7c5f5a4bfd8fd63184577525326123b519429bdc",
  UNIVERSAL_ROUTER: "0x6ff5693b99212da76ad316178a184ab56d299b43",
  
  // External Tokens
  WETH_BASE: "0x4200000000000000000000000000000000000006",
  
  // Special Addresses
  DEPLOYER: "0x21E914dFBB137F7fEC896F11bC8BAd6BCCDB147B",
  NULL_ADDRESS: "0x0000000000000000000000000000000000000000",
} as const;

// Pool Configuration
export const POOL_CONFIG = {
  FEE: 3000, // 0.3%
  TICK_SPACING: 60,
  HOOKS: CONTRACTS.NULL_ADDRESS,
  MIN_TICK: -887272,
  MAX_TICK: 887272,
} as const;

// Token Amounts (in wei strings for ethers.parseEther)
export const AMOUNTS = {
  // Distribution amounts
  AUCTION_TOKENS: "100000", // 100K ARCx
  AIRDROP_TOKENS: "50000", // 50K ARCx
  LP_ARCX: "25000", // 25K ARCx
  LP_ETH: "0.0016", // $4 USD worth ETH (at $2500/ETH = 0.0016 ETH)
  
  // Vesting amounts
  CORE_TEAM_VESTING: "200000", // 200K ARCx
  ECOSYSTEM_VESTING: "200000", // 200K ARCx
  
  // Pricing
  INITIAL_PRICE_ETH: "0.0005", // 1 ARCx = 0.0005 ETH
} as const;

// Network Configuration
export const NETWORK = {
  CHAIN_ID: 8453n, // Base mainnet
  NAME: "base",
  EXPLORER: "https://basescan.org",
} as const;

// Contract ABI fragments for common operations
export const ABI_FRAGMENTS = {
  ERC20_BASIC: [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
  ],
  
  PAUSABLE: [
    "function paused() view returns (bool)",
    "function pause()",
    "function unpause()",
  ],
  
  ACCESS_CONTROL: [
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
  ],
} as const;

// Common time constants
export const TIME = {
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  YEAR: 31536000,
} as const;

// Error messages and status constants
export const STATUS = {
  PASS: "PASS" as const,
  FAIL: "FAIL" as const,
  WARNING: "WARNING" as const,
  INFO: "INFO" as const,
} as const;

export const MESSAGES = {
  CONTRACT_NOT_DEPLOYED: "Contract not deployed at this address",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  SUCCESS: "Operation completed successfully",
  NETWORK_MISMATCH: "Wrong network - expected Base mainnet",
} as const;
