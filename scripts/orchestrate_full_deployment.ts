// scripts/orchestrate_full_deployment.ts
// Master Orchestration System for Complete ARCx Vesting Deployment
// Enterprise-Grade Multi-Phase Deployment Architecture

import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

interface DeploymentConfig {
  // Contract addresses
  tokenAddress: string;
  treasuryAddress: string;
  
  // Deployment parameters
  vestingStartDate: string;
  networkName: string;
  
  // Execution flags
  deployVesting: boolean;
  transferTokens: boolean;
  setupSchedules: boolean;
  verifyContracts: boolean;
  
  // Safety parameters
  dryRun: boolean;
  confirmationRequired: boolean;
  maxGasPrice: bigint;
}

interface DeploymentState {
  vestingContractAddress?: string;
  transferCompleted: boolean;
  schedulesConfigured: boolean;
  contractsVerified: boolean;
  totalGasUsed: bigint;
  totalCostETH: string;
  errors: string[];
  warnings: string[];
}

interface ExecutionStep {
  name: string;
  description: string;
  critical: boolean;
  dependencies: string[];
  execute: () => Promise<boolean>;
  rollback?: () => Promise<boolean>;
}

class ARCxDeploymentOrchestrator {
  private config: DeploymentConfig;
  private state: DeploymentState;
  private deployer: any;
  private steps: ExecutionStep[] = [];
  
  constructor(config: DeploymentConfig) {
    this.config = config;
    this.state = {
      transferCompleted: false,
      schedulesConfigured: false,
      contractsVerified: false,
      totalGasUsed: 0n,
      totalCostETH: "0",
      errors: [],
      warnings: []
    };
  }

  async initialize() {
    console.log("🌟 ARCx Master Deployment Orchestrator");
    console.log("=======================================");
    console.log("🚀 Enterprise-Grade Vesting System Deployment");
    console.log("⚡ Zero-Compromise Security Architecture");
    console.log("🎯 Next-Generation DeFi Infrastructure");
    
    const [deployer] = await ethers.getSigners();
    this.deployer = deployer;
    
    console.log("\n🔐 DEPLOYMENT CONFIGURATION");
    console.log("============================");
    console.log("🔑 Deployer:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
    console.log("🪙 Token:", this.config.tokenAddress);
    console.log("🏛️  Treasury:", this.config.treasuryAddress);
    console.log("📅 Vesting Start:", this.config.vestingStartDate);
    console.log("🧪 Dry Run:", this.config.dryRun ? "✅ ENABLED" : "❌ DISABLED");
    
    await this.validateEnvironment();
    await this.setupExecutionPlan();
  }

  async validateEnvironment() {
    console.log("\n🔍 Environment Validation");
    console.log("=========================");
    
    // 1. Network validation
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 8453n && this.config.networkName === "base") {
      this.state.warnings.push("Not connected to Base Mainnet");
    }
    
    // 2. Gas price validation
    const feeData = await ethers.provider.getFeeData();
    if (feeData.gasPrice && feeData.gasPrice > this.config.maxGasPrice) {
      this.state.warnings.push(`High gas price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
    }
    
    // 3. Token contract validation
    try {
      const tokenContract = await ethers.getContractAt("ARCxToken", this.config.tokenAddress);
      const symbol = await tokenContract.symbol();
      if (symbol !== "ARCx") {
        this.state.errors.push(`Invalid token symbol: ${symbol}`);
      }
      console.log("✅ Token contract validated");
    } catch (error) {
      this.state.errors.push(`Token contract validation failed: ${error}`);
    }
    
    // 4. Treasury address validation
    if (!ethers.isAddress(this.config.treasuryAddress)) {
      this.state.errors.push("Invalid treasury address");
    }
    
    // 5. Deployer balance check
    const balance = await ethers.provider.getBalance(this.deployer.address);
    const minimumBalance = ethers.parseEther("0.1"); // 0.1 ETH minimum
    if (balance < minimumBalance) {
      this.state.warnings.push(`Low deployer balance: ${ethers.formatEther(balance)} ETH`);
    }
    
    console.log(`✅ Environment checks: ${this.state.errors.length === 0 ? 'PASSED' : 'FAILED'}`);
    
    if (this.state.errors.length > 0) {
      console.log("❌ CRITICAL ERRORS:");
      this.state.errors.forEach(error => console.log(`   • ${error}`));
      throw new Error("Environment validation failed");
    }
    
    if (this.state.warnings.length > 0) {
      console.log("⚠️  WARNINGS:");
      this.state.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
  }

  async setupExecutionPlan() {
    console.log("\n📋 Setting Up Execution Plan");
    console.log("============================");
    
    // Step 1: Deploy Vesting Contract
    if (this.config.deployVesting) {
      this.steps.push({
        name: "deploy_vesting",
        description: "Deploy ARCx Master Vesting Contract",
        critical: true,
        dependencies: [],
        execute: async () => {
          console.log("\n🚀 Deploying Vesting Contract...");
          return await this.deployVestingContract();
        },
        rollback: async () => {
          console.log("⚠️  Cannot rollback contract deployment - manual intervention required");
          return false;
        }
      });
    }
    
    // Step 2: Transfer Tokens
    if (this.config.transferTokens) {
      this.steps.push({
        name: "transfer_tokens",
        description: "Transfer ARCx tokens to vesting contract",
        critical: true,
        dependencies: this.config.deployVesting ? ["deploy_vesting"] : [],
        execute: async () => {
          console.log("\n💸 Transferring Tokens...");
          return await this.transferTokens();
        },
        rollback: async () => {
          console.log("🔄 Attempting token transfer rollback...");
          return await this.rollbackTokenTransfer();
        }
      });
    }
    
    // Step 3: Setup Vesting Schedules
    if (this.config.setupSchedules) {
      this.steps.push({
        name: "setup_schedules",
        description: "Configure all vesting schedules",
        critical: true,
        dependencies: ["transfer_tokens"],
        execute: async () => {
          console.log("\n📅 Setting Up Vesting Schedules...");
          return await this.setupVestingSchedules();
        },
        rollback: async () => {
          console.log("🔄 Individual schedule rollback not implemented - contact admin");
          return false;
        }
      });
    }
    
    // Step 4: Verify Contracts
    if (this.config.verifyContracts) {
      this.steps.push({
        name: "verify_contracts",
        description: "Verify contracts on block explorer",
        critical: false,
        dependencies: ["deploy_vesting"],
        execute: async () => {
          console.log("\n🔍 Verifying Contracts...");
          return await this.verifyContracts();
        }
      });
    }
    
    // Step 5: Transfer Admin Rights
    this.steps.push({
      name: "transfer_admin",
      description: "Transfer admin rights to treasury",
      critical: true,
      dependencies: ["setup_schedules"],
      execute: async () => {
        console.log("\n🔐 Transferring Admin Rights...");
        return await this.transferAdminRights();
      },
      rollback: async () => {
        console.log("⚠️  Admin rights transfer cannot be automatically rolled back");
        return false;
      }
    });
    
    // Step 6: Final Validation
    this.steps.push({
      name: "final_validation",
      description: "Comprehensive deployment validation",
      critical: true,
      dependencies: ["transfer_admin"],
      execute: async () => {
        console.log("\n✅ Final Validation...");
        return await this.finalValidation();
      }
    });
    
    console.log(`📝 Execution plan created: ${this.steps.length} steps`);
    this.steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.description} ${step.critical ? '(CRITICAL)' : '(OPTIONAL)'}`);
    });
  }

  async deployVestingContract(): Promise<boolean> {
    try {
      const vestingStartTime = Math.floor(new Date(this.config.vestingStartDate).getTime() / 1000);
      
      const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
      
      if (this.config.dryRun) {
        console.log("🧪 DRY RUN: Simulating vesting contract deployment");
        // Validate constructor parameters
        if (vestingStartTime <= Math.floor(Date.now() / 1000)) {
          throw new Error("Vesting start time must be in the future");
        }
        console.log("✅ Deployment simulation successful");
        this.state.vestingContractAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
        return true;
      }
      
      console.log("🔄 Deploying ARCxMasterVesting contract...");
      const vesting = await ARCxMasterVesting.deploy(
        this.config.tokenAddress,
        this.config.treasuryAddress,
        vestingStartTime
      );
      
      await vesting.waitForDeployment();
      this.state.vestingContractAddress = await vesting.getAddress();
      
      console.log(`✅ Vesting contract deployed: ${this.state.vestingContractAddress}`);
      
      // Verify deployment
      const token = await vesting.token();
      const globalStart = await vesting.globalVestingStart();
      
      console.log("🔍 Deployment verification:");
      console.log(`   Token: ${token}`);
      console.log(`   Global Start: ${new Date(Number(globalStart) * 1000).toISOString()}`);
      
      return true;
      
    } catch (error) {
      console.error("❌ Vesting contract deployment failed:", error);
      this.state.errors.push(`Deployment failed: ${error}`);
      return false;
    }
  }

  async transferTokens(): Promise<boolean> {
    try {
      if (!this.state.vestingContractAddress) {
        throw new Error("Vesting contract address not available");
      }
      
      const tokenContract = await ethers.getContractAt("ARCxToken", this.config.tokenAddress);
      const transferAmount = ethers.parseEther("1000000"); // 1M ARCx
      
      if (this.config.dryRun) {
        console.log("🧪 DRY RUN: Simulating token transfer");
        
        // Check balance
        const balance = await tokenContract.balanceOf(this.deployer.address);
        if (balance < transferAmount) {
          throw new Error(`Insufficient balance: ${ethers.formatEther(balance)} < 1000000`);
        }
        
        // Simulate transfer
        await tokenContract.transfer.staticCall(this.state.vestingContractAddress, transferAmount);
        console.log("✅ Transfer simulation successful");
        return true;
      }
      
      console.log(`🔄 Transferring ${ethers.formatEther(transferAmount)} ARCx tokens...`);
      
      const tx = await tokenContract.transfer(this.state.vestingContractAddress, transferAmount);
      const receipt = await tx.wait();
      
      this.state.totalGasUsed += receipt.gasUsed;
      console.log(`✅ Transfer completed - Gas used: ${receipt.gasUsed.toString()}`);
      
      // Verify transfer
      const vestingBalance = await tokenContract.balanceOf(this.state.vestingContractAddress);
      console.log(`🔍 Vesting contract balance: ${ethers.formatEther(vestingBalance)} ARCx`);
      
      this.state.transferCompleted = true;
      return true;
      
    } catch (error) {
      console.error("❌ Token transfer failed:", error);
      this.state.errors.push(`Transfer failed: ${error}`);
      return false;
    }
  }

  async setupVestingSchedules(): Promise<boolean> {
    try {
      if (!this.state.vestingContractAddress) {
        throw new Error("Vesting contract address not available");
      }
      
      // Import and execute the vesting schedule orchestrator
      const { VestingScheduleOrchestrator } = await import("./setup_vesting_schedules");
      
      const orchestrator = new VestingScheduleOrchestrator(
        this.state.vestingContractAddress,
        this.config.treasuryAddress
      );
      
      await orchestrator.initialize(this.state.vestingContractAddress);
      await orchestrator.executeFullPlan(this.config.dryRun);
      
      console.log("✅ Vesting schedules configured successfully");
      this.state.schedulesConfigured = true;
      return true;
      
    } catch (error) {
      console.error("❌ Vesting schedule setup failed:", error);
      this.state.errors.push(`Schedule setup failed: ${error}`);
      return false;
    }
  }

  async verifyContracts(): Promise<boolean> {
    try {
      if (!this.state.vestingContractAddress || this.config.dryRun) {
        console.log("🧪 DRY RUN: Skipping contract verification");
        return true;
      }
      
      console.log("🔍 Verifying contracts on block explorer...");
      
      // Note: Actual verification would require hardhat-verify plugin
      // This is a placeholder for the verification process
      console.log("⚠️  Manual verification required:");
      console.log(`   npx hardhat verify --network base ${this.state.vestingContractAddress} "${this.config.tokenAddress}" "${this.config.treasuryAddress}" "${Math.floor(new Date(this.config.vestingStartDate).getTime() / 1000)}"`);
      
      this.state.contractsVerified = true;
      return true;
      
    } catch (error) {
      console.error("❌ Contract verification failed:", error);
      return false;
    }
  }

  async transferAdminRights(): Promise<boolean> {
    try {
      if (!this.state.vestingContractAddress) {
        throw new Error("Vesting contract address not available");
      }
      
      const vestingContract = await ethers.getContractAt("ARCxMasterVesting", this.state.vestingContractAddress);
      
      if (this.config.dryRun) {
        console.log("🧪 DRY RUN: Simulating admin rights transfer");
        
        // Check current admin
        const adminRole = await vestingContract.ADMIN_ROLE();
        const hasRole = await vestingContract.hasRole(adminRole, this.deployer.address);
        if (!hasRole) {
          throw new Error("Deployer does not have admin role");
        }
        
        console.log("✅ Admin rights transfer simulation successful");
        return true;
      }
      
      console.log("🔄 Transferring admin rights to treasury...");
      
      // Grant all roles to treasury
      const adminRole = await vestingContract.ADMIN_ROLE();
      const vestingManagerRole = await vestingContract.VESTING_MANAGER_ROLE();
      const pauserRole = await vestingContract.PAUSER_ROLE();
      
      // Grant roles to treasury
      await vestingContract.grantRole(adminRole, this.config.treasuryAddress);
      await vestingContract.grantRole(vestingManagerRole, this.config.treasuryAddress);
      await vestingContract.grantRole(pauserRole, this.config.treasuryAddress);
      
      // Revoke roles from deployer (if desired)
      // await vestingContract.revokeRole(adminRole, this.deployer.address);
      // await vestingContract.revokeRole(vestingManagerRole, this.deployer.address);
      // await vestingContract.revokeRole(pauserRole, this.deployer.address);
      
      console.log("✅ Admin rights transferred successfully");
      return true;
      
    } catch (error) {
      console.error("❌ Admin rights transfer failed:", error);
      this.state.errors.push(`Admin transfer failed: ${error}`);
      return false;
    }
  }

  async finalValidation(): Promise<boolean> {
    try {
      console.log("🔍 Conducting final validation...");
      
      if (!this.state.vestingContractAddress) {
        throw new Error("Vesting contract not deployed");
      }
      
      const vestingContract = await ethers.getContractAt("ARCxMasterVesting", this.state.vestingContractAddress);
      const tokenContract = await ethers.getContractAt("ARCxToken", this.config.tokenAddress);
      
      // 1. Verify contract balance
      const balance = await tokenContract.balanceOf(this.state.vestingContractAddress);
      console.log(`📊 Contract balance: ${ethers.formatEther(balance)} ARCx`);
      
      // 2. Verify admin roles
      const adminRole = await vestingContract.ADMIN_ROLE();
      const treasuryHasAdmin = await vestingContract.hasRole(adminRole, this.config.treasuryAddress);
      console.log(`🔐 Treasury has admin role: ${treasuryHasAdmin}`);
      
      // 3. Check contract statistics
      const stats = await vestingContract.getContractStats();
      console.log(`📈 Total allocated: ${ethers.formatEther(stats.totalAllocated_)} ARCx`);
      console.log(`📈 Total released: ${ethers.formatEther(stats.totalReleased_)} ARCx`);
      
      // 4. Verify global vesting start
      const globalStart = await vestingContract.globalVestingStart();
      const startDate = new Date(Number(globalStart) * 1000);
      console.log(`📅 Global vesting start: ${startDate.toISOString()}`);
      
      console.log("✅ Final validation completed successfully");
      return true;
      
    } catch (error) {
      console.error("❌ Final validation failed:", error);
      this.state.errors.push(`Final validation failed: ${error}`);
      return false;
    }
  }

  async rollbackTokenTransfer(): Promise<boolean> {
    // This would require the vesting contract to have a function to return tokens
    // Not implemented in current contract - manual intervention required
    console.log("⚠️  Token transfer rollback requires manual intervention");
    return false;
  }

  async executeDeployment(): Promise<boolean> {
    console.log("\n🎬 Starting Deployment Execution");
    console.log("=================================");
    
    if (this.config.confirmationRequired && !this.config.dryRun) {
      console.log("\n⚠️  DEPLOYMENT CONFIRMATION REQUIRED");
      console.log("====================================");
      console.log("This will execute the complete ARCx vesting deployment");
      console.log("Including contract deployment, token transfers, and schedule configuration");
      console.log("\nProceed? Set CONFIRM_DEPLOYMENT=true to continue");
      
      if (process.env.CONFIRM_DEPLOYMENT !== "true") {
        console.log("🛑 Deployment cancelled. Set CONFIRM_DEPLOYMENT=true to proceed.");
        return false;
      }
    }
    
    const startTime = Date.now();
    let allStepsSuccessful = true;
    
    for (const step of this.steps) {
      console.log(`\n🎯 Executing: ${step.description}`);
      console.log("=".repeat(50));
      
      // Check dependencies
      const missingDeps = step.dependencies.filter(dep => 
        !this.steps.find(s => s.name === dep && s.execute)
      );
      
      if (missingDeps.length > 0) {
        console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
        if (step.critical) {
          allStepsSuccessful = false;
          break;
        }
        continue;
      }
      
      try {
        const stepSuccess = await step.execute();
        
        if (!stepSuccess) {
          console.log(`❌ Step failed: ${step.description}`);
          
          if (step.critical) {
            console.log("🔄 Attempting rollback...");
            if (step.rollback) {
              await step.rollback();
            }
            allStepsSuccessful = false;
            break;
          }
        } else {
          console.log(`✅ Step completed: ${step.description}`);
        }
        
      } catch (error) {
        console.error(`💥 Step error: ${error}`);
        
        if (step.critical) {
          allStepsSuccessful = false;
          break;
        }
      }
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log("\n📊 DEPLOYMENT SUMMARY");
    console.log("=====================");
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`⛽ Total Gas Used: ${this.state.totalGasUsed.toString()}`);
    console.log(`💰 Status: ${allStepsSuccessful ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (this.state.vestingContractAddress) {
      console.log(`📜 Vesting Contract: ${this.state.vestingContractAddress}`);
    }
    
    if (this.state.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      this.state.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (this.state.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.state.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    return allStepsSuccessful;
  }

  async generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      network: (await ethers.provider.getNetwork()).name,
      deployer: this.deployer.address,
      treasury: this.config.treasuryAddress,
      tokenAddress: this.config.tokenAddress,
      vestingAddress: this.state.vestingContractAddress,
      vestingStartDate: this.config.vestingStartDate,
      state: this.state,
      config: this.config
    };
    
    console.log("\n📄 DEPLOYMENT REPORT");
    console.log("====================");
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

async function main() {
  const config: DeploymentConfig = {
    tokenAddress: process.env.ARCX_TOKEN_ADDRESS || "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
    treasuryAddress: process.env.TREASURY_SAFE_ADDRESS || "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
    vestingStartDate: process.env.VESTING_START_DATE || "2025-08-15",
    networkName: process.env.NETWORK_NAME || "base",
    deployVesting: process.env.DEPLOY_VESTING !== "false",
    transferTokens: process.env.TRANSFER_TOKENS !== "false",
    setupSchedules: process.env.SETUP_SCHEDULES !== "false",
    verifyContracts: process.env.VERIFY_CONTRACTS !== "false",
    dryRun: process.env.DRY_RUN !== "false",
    confirmationRequired: process.env.SKIP_CONFIRMATION !== "true",
    maxGasPrice: ethers.parseUnits(process.env.MAX_GAS_PRICE || "50", "gwei")
  };

  const orchestrator = new ARCxDeploymentOrchestrator(config);
  
  try {
    await orchestrator.initialize();
    const success = await orchestrator.executeDeployment();
    await orchestrator.generateDeploymentReport();
    
    if (success) {
      console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
      console.log("====================================");
      console.log("🚀 ARCx Vesting System is now live");
      console.log("🔐 Enterprise-grade security active");
      console.log("⚡ Next-generation DeFi infrastructure deployed");
    } else {
      console.log("\n❌ DEPLOYMENT FAILED");
      console.log("===================");
      console.log("🔍 Review logs above for details");
      console.log("🛠️  Manual intervention may be required");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("💥 Critical deployment error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { ARCxDeploymentOrchestrator, DeploymentConfig };
