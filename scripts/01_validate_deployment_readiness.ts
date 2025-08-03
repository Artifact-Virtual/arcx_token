// scripts/validate_deployment_readiness.ts
// Enterprise Deployment Readiness Validation System
// Comprehensive Pre-Deployment Security & Configuration Audit

import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

interface ReadinessCheck {
  category: string;
  checks: ValidationCheck[];
}

interface ValidationCheck {
  name: string;
  status: "PASS" | "FAIL" | "WARNING" | "INFO";
  message: string;
  critical: boolean;
  recommendation?: string;
}

interface DeploymentReadiness {
  overall: "READY" | "NOT_READY" | "CAUTION";
  criticalIssues: number;
  warnings: number;
  categories: ReadinessCheck[];
  nextSteps: string[];
}

class DeploymentReadinessValidator {
  private deployer: any;
  private tokenContract: any;
  private treasuryAddress: string;
  private readiness: DeploymentReadiness;

  constructor() {
    this.treasuryAddress = process.env.TREASURY_SAFE_ADDRESS || "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38";
    this.readiness = {
      overall: "NOT_READY",
      criticalIssues: 0,
      warnings: 0,
      categories: [],
      nextSteps: []
    };
  }

  async initialize() {
    console.log("🔍 ARCx Deployment Readiness Validator");
    console.log("======================================");
    console.log("🎯 Enterprise-Grade Pre-Deployment Audit");
    console.log("🔐 Comprehensive Security & Configuration Check");
    
    const [deployer] = await ethers.getSigners();
    this.deployer = deployer;
    
    console.log("\n📋 AUDIT CONFIGURATION");
    console.log("=======================");
    console.log("🔑 Deployer:", deployer.address);
    console.log("🏛️  Treasury:", this.treasuryAddress);
    console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
    
    const tokenAddress = process.env.ARCX_TOKEN_ADDRESS || "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44";
    this.tokenContract = await ethers.getContractAt("ARCxToken", tokenAddress);
  }

  async validateEnvironment(): Promise<ReadinessCheck> {
    const checks: ValidationCheck[] = [];
    
    // Network validation
    const network = await ethers.provider.getNetwork();
    if (network.chainId === 8453n) {
      checks.push({
        name: "Network Configuration",
        status: "PASS",
        message: "Connected to Base Mainnet",
        critical: true
      });
    } else {
      checks.push({
        name: "Network Configuration",
        status: "FAIL",
        message: `Wrong network: ${network.name} (Chain ID: ${network.chainId})`,
        critical: true,
        recommendation: "Switch to Base Mainnet"
      });
    }

    // Environment variables
    const requiredEnvVars = [
      "ARCX_TOKEN_ADDRESS",
      "TREASURY_SAFE_ADDRESS",
      "PRIVATE_KEY"
    ];

    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        checks.push({
          name: `Environment: ${envVar}`,
          status: "PASS",
          message: "Variable configured",
          critical: true
        });
      } else {
        checks.push({
          name: `Environment: ${envVar}`,
          status: "FAIL",
          message: "Required environment variable missing",
          critical: true,
          recommendation: `Set ${envVar} in .env file`
        });
      }
    });

    // Deployer balance
    const balance = await ethers.provider.getBalance(this.deployer.address);
    const balanceETH = Number(ethers.formatEther(balance));
    
    if (balanceETH >= 0.1) {
      checks.push({
        name: "Deployer ETH Balance",
        status: "PASS",
        message: `${balanceETH.toFixed(4)} ETH available`,
        critical: true
      });
    } else if (balanceETH >= 0.05) {
      checks.push({
        name: "Deployer ETH Balance",
        status: "WARNING",
        message: `${balanceETH.toFixed(4)} ETH - may be insufficient for gas`,
        critical: false,
        recommendation: "Add more ETH for gas fees"
      });
    } else {
      checks.push({
        name: "Deployer ETH Balance",
        status: "FAIL",
        message: `${balanceETH.toFixed(4)} ETH - insufficient for deployment`,
        critical: true,
        recommendation: "Add ETH to deployer account"
      });
    }

    return {
      category: "Environment & Configuration",
      checks
    };
  }

  async validateTokenContract(): Promise<ReadinessCheck> {
    const checks: ValidationCheck[] = [];
    
    try {
      // Token contract validation
      const symbol = await this.tokenContract.symbol();
      const name = await this.tokenContract.name();
      const decimals = await this.tokenContract.decimals();
      const totalSupply = await this.tokenContract.totalSupply();
      
      checks.push({
        name: "Token Contract Access",
        status: "PASS",
        message: `Connected to ${name} (${symbol})`,
        critical: true
      });

      // Check if token contract has expected properties
      if (symbol === "ARCx" && decimals === 18) {
        checks.push({
          name: "Token Configuration",
          status: "PASS",
          message: "Symbol and decimals correct",
          critical: true
        });
      } else {
        checks.push({
          name: "Token Configuration",
          status: "FAIL",
          message: `Unexpected token: ${symbol}, decimals: ${decimals}`,
          critical: true
        });
      }

      // Check total supply
      const totalSupplyFormatted = ethers.formatEther(totalSupply);
      if (Number(totalSupplyFormatted) === 1000000) {
        checks.push({
          name: "Total Supply",
          status: "PASS",
          message: "1,000,000 ARCx total supply confirmed",
          critical: true
        });
      } else {
        checks.push({
          name: "Total Supply",
          status: "WARNING",
          message: `Total supply: ${totalSupplyFormatted} ARCx`,
          critical: false
        });
      }

      // Check deployer token balance
      const deployerBalance = await this.tokenContract.balanceOf(this.deployer.address);
      const deployerBalanceFormatted = ethers.formatEther(deployerBalance);
      
      if (Number(deployerBalanceFormatted) >= 1000000) {
        checks.push({
          name: "Deployer Token Balance",
          status: "PASS",
          message: `${deployerBalanceFormatted} ARCx available for transfer`,
          critical: true
        });
      } else {
        checks.push({
          name: "Deployer Token Balance",
          status: "FAIL",
          message: `Only ${deployerBalanceFormatted} ARCx available`,
          critical: true,
          recommendation: "Mint tokens to deployer account"
        });
      }

      // Check if token is paused
      const isPaused = await this.tokenContract.paused();
      checks.push({
        name: "Token Contract State",
        status: isPaused ? "WARNING" : "PASS",
        message: isPaused ? "Token contract is paused" : "Token contract is active",
        critical: false,
        recommendation: isPaused ? "Unpause token contract before deployment" : undefined
      });

    } catch (error) {
      checks.push({
        name: "Token Contract Access",
        status: "FAIL",
        message: `Cannot connect to token contract: ${error}`,
        critical: true,
        recommendation: "Verify ARCX_TOKEN_ADDRESS is correct"
      });
    }

    return {
      category: "Token Contract Validation",
      checks
    };
  }

  async validateTreasurySetup(): Promise<ReadinessCheck> {
    const checks: ValidationCheck[] = [];
    
    // Treasury address format
    if (ethers.isAddress(this.treasuryAddress)) {
      checks.push({
        name: "Treasury Address Format",
        status: "PASS",
        message: "Valid Ethereum address",
        critical: true
      });
    } else {
      checks.push({
        name: "Treasury Address Format",
        status: "FAIL",
        message: "Invalid treasury address format",
        critical: true,
        recommendation: "Verify TREASURY_SAFE_ADDRESS"
      });
    }

    // Check if treasury address is the expected Safe
    if (this.treasuryAddress.toLowerCase() === "0x8f8fdbfa1af9f53973a7003cbf26d854de9b2f38") {
      checks.push({
        name: "Treasury Address Verification",
        status: "PASS",
        message: "Treasury Safe address confirmed",
        critical: true
      });
    } else {
      checks.push({
        name: "Treasury Address Verification",
        status: "WARNING",
        message: "Using non-standard treasury address",
        critical: false,
        recommendation: "Verify this is the intended treasury address"
      });
    }

    // Check treasury has ETH for transactions
    const treasuryBalance = await ethers.provider.getBalance(this.treasuryAddress);
    const treasuryETH = Number(ethers.formatEther(treasuryBalance));
    
    if (treasuryETH > 0) {
      checks.push({
        name: "Treasury ETH Balance",
        status: "PASS",
        message: `${treasuryETH.toFixed(4)} ETH in treasury`,
        critical: false
      });
    } else {
      checks.push({
        name: "Treasury ETH Balance",
        status: "WARNING",
        message: "No ETH in treasury for future transactions",
        critical: false,
        recommendation: "Fund treasury for operational transactions"
      });
    }

    return {
      category: "Treasury & Multisig Setup",
      checks
    };
  }

  async validateDeploymentFiles(): Promise<ReadinessCheck> {
    const checks: ValidationCheck[] = [];
    
    const requiredFiles = [
      "contracts/ARCx_MVC.sol",
      "scripts/deploy_vesting.ts",
      "scripts/transfer_tokens_to_vesting.ts",
      "scripts/setup_vesting_schedules.ts",
      "scripts/orchestrate_full_deployment.ts"
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        checks.push({
          name: `File: ${file}`,
          status: "PASS",
          message: "File exists and ready",
          critical: true
        });
      } else {
        checks.push({
          name: `File: ${file}`,
          status: "FAIL",
          message: "Required file missing",
          critical: true,
          recommendation: `Ensure ${file} exists`
        });
      }
    });

    // Check if test files exist
    const testFile = "tests/ARCxMasterVesting.test.ts";
    if (fs.existsSync(path.join(process.cwd(), testFile))) {
      checks.push({
        name: "Test Suite",
        status: "PASS",
        message: "Test files available",
        critical: false
      });
    } else {
      checks.push({
        name: "Test Suite",
        status: "WARNING",
        message: "Test files not found",
        critical: false,
        recommendation: "Run tests before deployment"
      });
    }

    return {
      category: "Deployment Files & Scripts",
      checks
    };
  }

  async generateReadinessReport(): Promise<DeploymentReadiness> {
    console.log("\n🔍 Conducting Comprehensive Readiness Audit...");
    
    // Run all validation categories
    const environmentCheck = await this.validateEnvironment();
    const tokenCheck = await this.validateTokenContract();
    const treasuryCheck = await this.validateTreasurySetup();
    const filesCheck = await this.validateDeploymentFiles();
    
    this.readiness.categories = [
      environmentCheck,
      tokenCheck,
      treasuryCheck,
      filesCheck
    ];

    // Calculate overall readiness
    let criticalIssues = 0;
    let warnings = 0;

    this.readiness.categories.forEach(category => {
      category.checks.forEach(check => {
        if (check.status === "FAIL" && check.critical) {
          criticalIssues++;
        } else if (check.status === "WARNING") {
          warnings++;
        }
      });
    });

    this.readiness.criticalIssues = criticalIssues;
    this.readiness.warnings = warnings;

    // Determine overall status
    if (criticalIssues === 0) {
      this.readiness.overall = warnings === 0 ? "READY" : "CAUTION";
    } else {
      this.readiness.overall = "NOT_READY";
    }

    // Generate next steps
    if (criticalIssues === 0) {
      this.readiness.nextSteps = [
        "✅ All critical checks passed",
        "🚀 Proceed with deployment execution",
        "📋 Execute dry run first: DRY_RUN=true",
        "🎯 Run: npx hardhat run scripts/orchestrate_full_deployment.ts --network base"
      ];
    } else {
      this.readiness.nextSteps = [
        "❌ Resolve critical issues before deployment",
        "🔧 Review failed checks and recommendations",
        "🔄 Re-run validation after fixes",
        "📞 Contact team if issues persist"
      ];
    }

    return this.readiness;
  }

  displayReadinessReport() {
    console.log("\n📊 DEPLOYMENT READINESS REPORT");
    console.log("===============================");
    
    // Overall status
    const statusEmoji = this.readiness.overall === "READY" ? "✅" : 
                       this.readiness.overall === "CAUTION" ? "⚠️" : "❌";
    
    console.log(`${statusEmoji} Overall Status: ${this.readiness.overall}`);
    console.log(`🚨 Critical Issues: ${this.readiness.criticalIssues}`);
    console.log(`⚠️  Warnings: ${this.readiness.warnings}`);
    
    // Category details
    this.readiness.categories.forEach(category => {
      console.log(`\n📂 ${category.category}`);
      console.log("─".repeat(category.category.length + 3));
      
      category.checks.forEach(check => {
        const emoji = check.status === "PASS" ? "✅" : 
                     check.status === "WARNING" ? "⚠️" : 
                     check.status === "FAIL" ? "❌" : "ℹ️";
        
        console.log(`${emoji} ${check.name}: ${check.message}`);
        if (check.recommendation) {
          console.log(`   💡 ${check.recommendation}`);
        }
      });
    });

    // Next steps
    console.log("\n🎯 NEXT STEPS");
    console.log("=============");
    this.readiness.nextSteps.forEach(step => {
      console.log(step);
    });

    // Save report
    const reportPath = path.join(__dirname, "..", "reports", `readiness-audit-${Date.now()}.json`);
    try {
      if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      }
      fs.writeFileSync(reportPath, JSON.stringify(this.readiness, null, 2));
      console.log(`\n📁 Readiness report saved: ${reportPath}`);
    } catch (error) {
      console.warn("⚠️  Could not save readiness report:", error);
    }
  }
}

async function main() {
  const validator = new DeploymentReadinessValidator();
  
  try {
    await validator.initialize();
    await validator.generateReadinessReport();
    validator.displayReadinessReport();
    
    // Exit with appropriate code
    const readiness = validator.readiness;
    if (readiness.overall === "NOT_READY") {
      console.log("\n🛑 DEPLOYMENT BLOCKED - Resolve critical issues first");
      process.exit(1);
    } else if (readiness.overall === "CAUTION") {
      console.log("\n⚠️  DEPLOYMENT CAUTION - Review warnings before proceeding");
      process.exit(0);
    } else {
      console.log("\n🚀 DEPLOYMENT READY - All systems go!");
      process.exit(0);
    }
    
  } catch (error) {
    console.error("💥 Validation error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => {})
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { DeploymentReadinessValidator, DeploymentReadiness, ValidationCheck };
