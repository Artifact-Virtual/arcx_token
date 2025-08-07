// scripts/shared/utils.ts
// Shared utilities to eliminate code duplication across scripts

import { ethers } from "hardhat";
import { CONTRACTS, NETWORK, STATUS, MESSAGES, ABI_FRAGMENTS } from "./constants";

export interface ContractStatus {
  address: string;
  name: string;
  isDeployed: boolean;
  balance: string;
  error?: string;
}

export interface ValidationResult {
  name: string;
  status: typeof STATUS[keyof typeof STATUS];
  message: string;
  critical: boolean;
  recommendation?: string;
}

/**
 * Check if a contract is deployed at the given address
 */
export async function isContractDeployed(address: string): Promise<boolean> {
  try {
    const code = await ethers.provider.getCode(address);
    return code !== "0x";
  } catch {
    return false;
  }
}

/**
 * Get comprehensive contract status including deployment and balance
 */
export async function getContractStatus(address: string, name: string): Promise<ContractStatus> {
  try {
    const isDeployed = await isContractDeployed(address);
    const balance = await ethers.provider.getBalance(address);
    
    return {
      address,
      name,
      isDeployed,
      balance: ethers.formatEther(balance),
    };
  } catch (error: any) {
    return {
      address,
      name,
      isDeployed: false,
      balance: "0",
      error: error.message,
    };
  }
}

/**
 * Validate network is Base mainnet
 */
export async function validateNetwork(): Promise<ValidationResult> {
  const network = await ethers.provider.getNetwork();
  
  if (network.chainId === NETWORK.CHAIN_ID) {
    return {
      name: "Network Validation",
      status: STATUS.PASS,
      message: "Connected to Base Mainnet",
      critical: true,
    };
  } else {
    return {
      name: "Network Validation", 
      status: STATUS.FAIL,
      message: `Wrong network: ${network.name} (Chain ID: ${network.chainId})`,
      critical: true,
      recommendation: "Switch to Base Mainnet",
    };
  }
}

/**
 * Get token contract with standard ERC20 interface
 */
export async function getTokenContract(address: string) {
  return await ethers.getContractAt("ARCxToken", address);
}

/**
 * Get basic ERC20 contract interface
 */
export function getERC20Contract(address: string) {
  return new ethers.Contract(address, ABI_FRAGMENTS.ERC20_BASIC, ethers.provider);
}

/**
 * Check if signer has sufficient ETH balance
 */
export async function checkEthBalance(address: string, requiredEth: string): Promise<ValidationResult> {
  const balance = await ethers.provider.getBalance(address);
  const required = ethers.parseEther(requiredEth);
  
  if (balance >= required) {
    return {
      name: "ETH Balance Check",
      status: STATUS.PASS,
      message: `Sufficient balance: ${ethers.formatEther(balance)} ETH`,
      critical: true,
    };
  } else {
    return {
      name: "ETH Balance Check",
      status: STATUS.FAIL, 
      message: `Insufficient balance: ${ethers.formatEther(balance)} ETH (need ${requiredEth} ETH)`,
      critical: true,
      recommendation: `Fund account with ${ethers.formatEther(required - balance)} ETH`,
    };
  }
}

/**
 * Check if address has sufficient token balance
 */
export async function checkTokenBalance(
  tokenAddress: string, 
  holderAddress: string, 
  requiredAmount: string
): Promise<ValidationResult> {
  try {
    const token = await getTokenContract(tokenAddress);
    const balance = await token.balanceOf(holderAddress);
    const required = ethers.parseEther(requiredAmount);
    
    if (balance >= required) {
      return {
        name: "Token Balance Check",
        status: STATUS.PASS,
        message: `Sufficient tokens: ${ethers.formatEther(balance)} ARCx`,
        critical: true,
      };
    } else {
      return {
        name: "Token Balance Check",
        status: STATUS.FAIL,
        message: `Insufficient tokens: ${ethers.formatEther(balance)} ARCx (need ${requiredAmount} ARCx)`,
        critical: true,
        recommendation: `Transfer ${ethers.formatEther(required - balance)} ARCx to account`,
      };
    }
  } catch (error: any) {
    return {
      name: "Token Balance Check",
      status: STATUS.FAIL,
      message: `Error checking balance: ${error.message}`,
      critical: true,
      recommendation: "Verify token contract address and network",
    };
  }
}

/**
 * Print formatted validation results
 */
export function printValidationResults(results: ValidationResult[]) {
  console.log("\n📋 VALIDATION RESULTS");
  console.log("=====================");
  
  let criticalIssues = 0;
  let warnings = 0;
  
  for (const result of results) {
    const emoji = result.status === STATUS.PASS ? "✅" : 
                 result.status === STATUS.FAIL ? "❌" : 
                 result.status === STATUS.WARNING ? "⚠️" : "ℹ️";
    
    console.log(`${emoji} ${result.name}: ${result.message}`);
    
    if (result.recommendation) {
      console.log(`   💡 ${result.recommendation}`);
    }
    
    if (result.status === STATUS.FAIL && result.critical) {
      criticalIssues++;
    } else if (result.status === STATUS.WARNING) {
      warnings++;
    }
  }
  
  console.log(`\n📊 Summary: ${criticalIssues} critical issues, ${warnings} warnings`);
  return { criticalIssues, warnings };
}

/**
 * Print contract status table
 */
export function printContractStatusTable(statuses: ContractStatus[]) {
  console.log("\n📍 CONTRACT STATUS");
  console.log("==================");
  
  for (const status of statuses) {
    const emoji = status.isDeployed ? "✅" : "❌";
    const balance = status.balance !== "0" ? ` (${status.balance} ETH)` : "";
    
    console.log(`${emoji} ${status.name}: ${status.isDeployed ? "DEPLOYED" : "NOT DEPLOYED"}${balance}`);
    
    if (status.error) {
      console.log(`   ⚠️ Error: ${status.error}`);
    }
  }
}

/**
 * Get all core contract statuses
 */
export async function getAllContractStatuses(): Promise<ContractStatus[]> {
  const contractChecks = [
    { address: CONTRACTS.ARCX_TOKEN, name: "ARCx Token" },
    { address: CONTRACTS.DUTCH_AUCTION, name: "Dutch Auction" },
    { address: CONTRACTS.SMART_AIRDROP, name: "Smart Airdrop" },
    { address: CONTRACTS.MASTER_VESTING, name: "Master Vesting" },
    { address: CONTRACTS.TREASURY_SAFE, name: "Treasury Safe" },
    { address: CONTRACTS.ECOSYSTEM_SAFE, name: "Ecosystem Safe" },
  ];
  
  const statuses: ContractStatus[] = [];
  
  for (const contract of contractChecks) {
    const status = await getContractStatus(contract.address, contract.name);
    statuses.push(status);
  }
  
  return statuses;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Calculate time remaining in human readable format
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Expired";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Safe contract interaction with error handling
 */
export async function safeContractCall<T>(
  contractCall: () => Promise<T>,
  errorMessage: string = "Contract call failed"
): Promise<T | null> {
  try {
    return await contractCall();
  } catch (error: any) {
    console.log(`❌ ${errorMessage}: ${error.message}`);
    return null;
  }
}

/**
 * Display script header with consistent formatting
 */
export function displayScriptHeader(title: string, description?: string) {
  console.log(`🚀 ${title}`);
  console.log("=".repeat(title.length + 4));
  
  if (description) {
    console.log(description);
  }
  
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🌐 Network: ${NETWORK.NAME} (Chain ID: ${NETWORK.CHAIN_ID})`);
}
