// scripts/setup_vesting_schedules.ts
// Enterprise-Grade Vesting Schedule Orchestration System
// Next-Generation DeFi Token Distribution Architecture

import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

interface VestingSchedule {
  category: VestingCategory;
  categoryName: string;
  beneficiaries: BeneficiaryConfig[];
  totalAllocation: bigint;
  maxAllocation: bigint;
}

interface BeneficiaryConfig {
  address: string;
  amount: bigint;
  cliff: number; // in days
  duration: number; // in days
  description: string;
  priority: number; // 1 = highest priority
}

enum VestingCategory {
  CORE_TEAM = 0,
  ECOSYSTEM_FUND = 1,
  COMMUNITY_AIRDROP = 2,
  STRATEGIC_PARTNERS = 3,
  PUBLIC_SALE = 4,
  TREASURY_RESERVE = 5
}

interface ScheduleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  gasEstimate: bigint;
}

interface ExecutionPlan {
  phases: ExecutionPhase[];
  totalGasEstimate: bigint;
  estimatedCost: string;
  timeEstimate: string;
}

interface ExecutionPhase {
  name: string;
  transactions: TransactionConfig[];
  dependencies: string[];
}

interface TransactionConfig {
  description: string;
  method: string;
  params: any[];
  gasEstimate: bigint;
  priority: number;
}

class VestingScheduleOrchestrator {
  private vestingContract: any;
  private deployer: any;
  private schedules: VestingSchedule[] = [];
  private treasuryAddress: string;

  constructor(vestingAddress: string, treasuryAddress: string) {
    this.treasuryAddress = treasuryAddress;
  }

  async initialize(vestingAddress: string) {
    console.log("🎯 ARCx Vesting Schedule Orchestrator");
    console.log("======================================");
    
    const [deployer] = await ethers.getSigners();
    this.deployer = deployer;
    
    console.log("🔑 Deployer:", deployer.address);
    console.log("🏛️  Treasury:", this.treasuryAddress);
    console.log("📜 Vesting Contract:", vestingAddress);
    
    this.vestingContract = await ethers.getContractAt("ARCxMasterVesting", vestingAddress);
    
    // Verify contract connection
    const token = await this.vestingContract.token();
    console.log("🪙 Token Address:", token);
    
    await this.loadDefaultSchedules();
  }

  async loadDefaultSchedules() {
    console.log("\n📋 Loading ARCx Allocation Schedules...");
    
    // Core Team & Developers (20% = 200,000 ARCx)
    // 6-12 month cliff, 18-36 month linear vesting
    const coreTeamSchedule: VestingSchedule = {
      category: VestingCategory.CORE_TEAM,
      categoryName: "Core Team & Developers",
      totalAllocation: 0n,
      maxAllocation: ethers.parseEther("200000"),
      beneficiaries: [
        {
          address: this.treasuryAddress, // Treasury Safe for Core Team allocation
          amount: ethers.parseEther("50000"), // Lead Developer
          cliff: 365, // 12 months
          duration: 365 * 3, // 36 months total
          description: "Lead Developer Allocation (Treasury Managed)",
          priority: 1
        },
        {
          address: "0x0000000000000000000000000000000000000002", // TODO: Replace with actual Senior Developer address
          amount: ethers.parseEther("40000"), // Senior Developer
          cliff: 365,
          duration: 365 * 3,
          description: "Senior Developer Allocation",
          priority: 2
        },
        {
          address: "0x0000000000000000000000000000000000000003", // TODO: Replace with actual Protocol Architect address
          amount: ethers.parseEther("30000"), // Protocol Architect
          cliff: 365,
          duration: 365 * 3,
          description: "Protocol Architect Allocation",
          priority: 3
        },
        {
          address: "0x0000000000000000000000000000000000000004", // TODO: Replace with actual Security Specialist address
          amount: ethers.parseEther("25000"), // Security Specialist
          cliff: 270, // 9 months
          duration: 365 * 2, // 24 months total
          description: "Security Specialist Allocation",
          priority: 4
        },
        {
          address: this.treasuryAddress, // Treasury Safe for Development Team Pool
          amount: ethers.parseEther("35000"), // Development Team Pool
          cliff: 180, // 6 months
          duration: 365 * 2, // 24 months total
          description: "Development Team Pool (Treasury Managed)",
          priority: 5
        },
        {
          address: this.treasuryAddress, // Treasury Safe for Future Hires
          amount: ethers.parseEther("20000"), // Future Hires Reserve
          cliff: 180,
          duration: 365 * 2,
          description: "Future Core Team Hires (Treasury Reserve)",
          priority: 6
        }
      ]
    };

    // Ecosystem Fund (25% = 250,000 ARCx)
    // 25% unlocked at launch, 75% vests linearly over 1 year
    const ecosystemSchedule: VestingSchedule = {
      category: VestingCategory.ECOSYSTEM_FUND,
      categoryName: "Ecosystem Fund",
      totalAllocation: 0n,
      maxAllocation: ethers.parseEther("250000"),
      beneficiaries: [
        {
          address: this.treasuryAddress, // Treasury manages ecosystem fund
          amount: ethers.parseEther("62500"), // 25% immediate unlock
          cliff: 0, // No cliff - immediate
          duration: 1, // Immediate vesting
          description: "Ecosystem Fund - Immediate Unlock (25%)",
          priority: 1
        },
        {
          address: this.treasuryAddress,
          amount: ethers.parseEther("187500"), // 75% linear over 1 year
          cliff: 0, // No cliff
          duration: 365, // 1 year
          description: "Ecosystem Fund - Linear Vesting (75%)",
          priority: 2
        }
      ]
    };

    // Community & Airdrop (15% = 150,000 ARCx)
    // Immediate claim or 3 month vesting option
    const communitySchedule: VestingSchedule = {
      category: VestingCategory.COMMUNITY_AIRDROP,
      categoryName: "Community & Airdrop",
      totalAllocation: 0n,
      maxAllocation: ethers.parseEther("150000"),
      beneficiaries: [
        {
          address: this.treasuryAddress, // Treasury manages community distribution
          amount: ethers.parseEther("75000"), // 50% immediate
          cliff: 0,
          duration: 1,
          description: "Community Allocation - Immediate (Treasury Managed)",
          priority: 1
        },
        {
          address: this.treasuryAddress, // Treasury manages airdrop distribution
          amount: ethers.parseEther("75000"), // 50% with 3 month vesting
          cliff: 0,
          duration: 90, // 3 months
          description: "Community Allocation - 3 Month Vesting (Treasury Managed)",
          priority: 2
        }
      ]
    };

    // Strategic Partners (10% = 100,000 ARCx)
    // 6 month cliff, then linear vesting over 12 months
    const partnersSchedule: VestingSchedule = {
      category: VestingCategory.STRATEGIC_PARTNERS,
      categoryName: "Strategic Partners",
      totalAllocation: 0n,
      maxAllocation: ethers.parseEther("100000"),
      beneficiaries: [
        {
          address: "0x0000000000000000000000000000000000000009", // Strategic Partner 1
          amount: ethers.parseEther("40000"),
          cliff: 180, // 6 months
          duration: 365, // 12 months total
          description: "Strategic Partner - Tier 1",
          priority: 1
        },
        {
          address: "0x000000000000000000000000000000000000000A", // Strategic Partner 2
          amount: ethers.parseEther("30000"),
          cliff: 180,
          duration: 365,
          description: "Strategic Partner - Tier 2",
          priority: 2
        },
        {
          address: "0x000000000000000000000000000000000000000B", // Strategic Partner 3
          amount: ethers.parseEther("30000"),
          cliff: 180,
          duration: 365,
          description: "Strategic Partner - Tier 3",
          priority: 3
        }
      ]
    };

    // Public Sale (20% = 200,000 ARCx)
    // Fully unlocked at sale event, no vesting
    const publicSaleSchedule: VestingSchedule = {
      category: VestingCategory.PUBLIC_SALE,
      categoryName: "Public Sale",
      totalAllocation: 0n,
      maxAllocation: ethers.parseEther("200000"),
      beneficiaries: [
        {
          address: this.treasuryAddress, // Treasury manages public sale proceeds
          amount: ethers.parseEther("200000"),
          cliff: 0,
          duration: 1, // Immediate unlock
          description: "Public Sale Allocation - Treasury Managed",
          priority: 1
        }
      ]
    };

    // Treasury Reserve (10% = 100,000 ARCx)
    // Locked for 2 years, protocol use only
    const treasurySchedule: VestingSchedule = {
      category: VestingCategory.TREASURY_RESERVE,
      categoryName: "Treasury Reserve",
      totalAllocation: 0n,
      maxAllocation: ethers.parseEther("100000"),
      beneficiaries: [
        {
          address: this.treasuryAddress,
          amount: ethers.parseEther("100000"),
          cliff: 365 * 2, // 2 years lock
          duration: 365 * 2 + 1, // 2 years + 1 day for immediate unlock after cliff
          description: "Treasury Reserve - 2 Year Lock",
          priority: 1
        }
      ]
    };

    this.schedules = [
      coreTeamSchedule,
      ecosystemSchedule,
      communitySchedule,
      partnersSchedule,
      publicSaleSchedule,
      treasurySchedule
    ];

    // Calculate total allocations
    this.schedules.forEach(schedule => {
      schedule.totalAllocation = schedule.beneficiaries.reduce(
        (sum, beneficiary) => sum + beneficiary.amount, 
        0n
      );
    });

    console.log("✅ Schedules loaded successfully");
    this.displayScheduleSummary();
  }

  displayScheduleSummary() {
    console.log("\n📊 VESTING SCHEDULE SUMMARY");
    console.log("============================");
    
    let grandTotal = 0n;
    
    this.schedules.forEach(schedule => {
      console.log(`\n🏷️  ${schedule.categoryName}`);
      console.log(`   Max Allocation: ${ethers.formatEther(schedule.maxAllocation)} ARCx`);
      console.log(`   Planned Allocation: ${ethers.formatEther(schedule.totalAllocation)} ARCx`);
      console.log(`   Utilization: ${(Number(schedule.totalAllocation * 100n / schedule.maxAllocation))}%`);
      console.log(`   Beneficiaries: ${schedule.beneficiaries.length}`);
      
      grandTotal += schedule.totalAllocation;
    });
    
    console.log(`\n💰 TOTAL ALLOCATION: ${ethers.formatEther(grandTotal)} ARCx`);
    console.log(`📈 Total Utilization: ${Number(grandTotal * 100n / ethers.parseEther("1000000"))}%`);
  }

  async validateSchedules(): Promise<ScheduleValidation> {
    console.log("\n🔍 Validating Vesting Schedules...");
    
    const validation: ScheduleValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      gasEstimate: 0n
    };

    try {
      // 1. Check total allocations don't exceed limits
      for (const schedule of this.schedules) {
        if (schedule.totalAllocation > schedule.maxAllocation) {
          validation.errors.push(
            `${schedule.categoryName}: Allocation ${ethers.formatEther(schedule.totalAllocation)} exceeds limit ${ethers.formatEther(schedule.maxAllocation)}`
          );
        }
      }

      // 2. Check for duplicate addresses
      const allAddresses = new Set<string>();
      const duplicates = new Set<string>();
      
      this.schedules.forEach(schedule => {
        schedule.beneficiaries.forEach(beneficiary => {
          const addr = beneficiary.address.toLowerCase();
          if (allAddresses.has(addr)) {
            duplicates.add(addr);
          }
          allAddresses.add(addr);
        });
      });

      if (duplicates.size > 0) {
        validation.warnings.push(`Duplicate addresses found: ${Array.from(duplicates).join(', ')}`);
      }

      // 3. Check for placeholder addresses
      const placeholders = Array.from(allAddresses).filter(addr => 
        addr.startsWith('0x000000000000000000000000000000000000000')
      );
      
      if (placeholders.length > 0) {
        validation.errors.push(`Placeholder addresses detected: ${placeholders.length} addresses need to be replaced`);
      }

      // 4. Validate vesting parameters
      this.schedules.forEach(schedule => {
        schedule.beneficiaries.forEach(beneficiary => {
          if (beneficiary.cliff > beneficiary.duration) {
            validation.errors.push(
              `${schedule.categoryName} - ${beneficiary.description}: Cliff (${beneficiary.cliff}d) exceeds duration (${beneficiary.duration}d)`
            );
          }
          
          if (beneficiary.amount === 0n) {
            validation.errors.push(
              `${schedule.categoryName} - ${beneficiary.description}: Zero amount allocation`
            );
          }
        });
      });

      // 5. Estimate gas costs
      let totalGasEstimate = 0n;
      
      for (const schedule of this.schedules) {
        for (const beneficiary of schedule.beneficiaries) {
          try {
            const gasEstimate = await this.vestingContract.addVesting.estimateGas(
              beneficiary.address,
              beneficiary.amount,
              0, // Use global start
              beneficiary.cliff * 86400, // Convert days to seconds
              beneficiary.duration * 86400,
              schedule.category
            );
            totalGasEstimate += gasEstimate;
          } catch (error) {
            validation.warnings.push(`Gas estimation failed for ${beneficiary.description}`);
          }
        }
      }
      
      validation.gasEstimate = totalGasEstimate;
      
      // 6. Check contract balance
      const tokenAddress = await this.vestingContract.token();
      const tokenContract = await ethers.getContractAt("IERC20", tokenAddress);
      const contractBalance = await tokenContract.balanceOf(await this.vestingContract.getAddress());
      const totalAllocation = this.schedules.reduce((sum, schedule) => sum + schedule.totalAllocation, 0n);
      
      if (contractBalance < totalAllocation) {
        validation.errors.push(
          `Insufficient contract balance: ${ethers.formatEther(contractBalance)} < ${ethers.formatEther(totalAllocation)}`
        );
      }

      // 7. Check roles
      const vestingManagerRole = await this.vestingContract.VESTING_MANAGER_ROLE();
      const hasRole = await this.vestingContract.hasRole(vestingManagerRole, this.deployer.address);
      
      if (!hasRole) {
        validation.errors.push("Deployer does not have VESTING_MANAGER_ROLE");
      }

    } catch (error) {
      validation.errors.push(`Validation error: ${error}`);
    }

    validation.isValid = validation.errors.length === 0;

    // Display results
    console.log("\n📊 Validation Results:");
    console.log("======================");
    
    if (validation.errors.length > 0) {
      console.log("❌ ERRORS:");
      validation.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log("⚠️  WARNINGS:");
      validation.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log(`💨 Estimated Gas: ${validation.gasEstimate.toString()}`);
    console.log(`✅ Validation Status: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    
    return validation;
  }

  async createExecutionPlan(): Promise<ExecutionPlan> {
    console.log("\n🎯 Creating Execution Plan...");
    
    const phases: ExecutionPhase[] = [];
    let totalGasEstimate = 0n;

    // Phase 1: High Priority Immediate Unlocks
    const immediatePhase: ExecutionPhase = {
      name: "Phase 1: Immediate Unlocks",
      transactions: [],
      dependencies: []
    };

    // Phase 2: Community and Ecosystem
    const communityPhase: ExecutionPhase = {
      name: "Phase 2: Community & Ecosystem",
      transactions: [],
      dependencies: ["Phase 1: Immediate Unlocks"]
    };

    // Phase 3: Core Team and Partners
    const corePhase: ExecutionPhase = {
      name: "Phase 3: Core Team & Partners",
      transactions: [],
      dependencies: ["Phase 2: Community & Ecosystem"]
    };

    // Phase 4: Treasury and Long-term
    const treasuryPhase: ExecutionPhase = {
      name: "Phase 4: Treasury & Long-term",
      transactions: [],
      dependencies: ["Phase 3: Core Team & Partners"]
    };

    // Categorize transactions by urgency and dependencies
    this.schedules.forEach(schedule => {
      schedule.beneficiaries.forEach(beneficiary => {
        const txConfig: TransactionConfig = {
          description: `${schedule.categoryName} - ${beneficiary.description}`,
          method: "addVesting",
          params: [
            beneficiary.address,
            beneficiary.amount,
            0, // Use global start
            beneficiary.cliff * 86400,
            beneficiary.duration * 86400,
            schedule.category
          ],
          gasEstimate: 250000n, // Conservative estimate
          priority: beneficiary.priority
        };

        // Route to appropriate phase based on category and urgency
        if (beneficiary.cliff === 0 && beneficiary.duration <= 1) {
          immediatePhase.transactions.push(txConfig);
        } else if (schedule.category === VestingCategory.COMMUNITY_AIRDROP || 
                   schedule.category === VestingCategory.ECOSYSTEM_FUND) {
          communityPhase.transactions.push(txConfig);
        } else if (schedule.category === VestingCategory.CORE_TEAM || 
                   schedule.category === VestingCategory.STRATEGIC_PARTNERS) {
          corePhase.transactions.push(txConfig);
        } else {
          treasuryPhase.transactions.push(txConfig);
        }

        totalGasEstimate += txConfig.gasEstimate;
      });
    });

    // Sort transactions within each phase by priority
    [immediatePhase, communityPhase, corePhase, treasuryPhase].forEach(phase => {
      phase.transactions.sort((a, b) => a.priority - b.priority);
    });

    phases.push(immediatePhase, communityPhase, corePhase, treasuryPhase);

    // Calculate estimated costs and time
    const gasPrice = await ethers.provider.getFeeData();
    const estimatedCostWei = totalGasEstimate * (gasPrice.gasPrice || 50000000n);
    const estimatedCost = ethers.formatEther(estimatedCostWei);
    
    const totalTransactions = phases.reduce((sum, phase) => sum + phase.transactions.length, 0);
    const timeEstimate = `${Math.ceil(totalTransactions * 2)} minutes`; // 2 min per tx estimate

    const plan: ExecutionPlan = {
      phases,
      totalGasEstimate,
      estimatedCost,
      timeEstimate
    };

    console.log("\n📋 EXECUTION PLAN");
    console.log("=================");
    phases.forEach((phase, index) => {
      console.log(`\n${index + 1}. ${phase.name}`);
      console.log(`   Transactions: ${phase.transactions.length}`);
      console.log(`   Dependencies: ${phase.dependencies.join(', ') || 'None'}`);
      
      phase.transactions.forEach((tx, txIndex) => {
        console.log(`   ${txIndex + 1}. ${tx.description}`);
      });
    });
    
    console.log(`\n💰 Estimated Cost: ${estimatedCost} ETH`);
    console.log(`⏱️  Estimated Time: ${timeEstimate}`);
    console.log(`🔥 Total Gas: ${totalGasEstimate.toString()}`);

    return plan;
  }

  async executePhase(phase: ExecutionPhase, dryRun: boolean = true): Promise<boolean> {
    console.log(`\n🚀 ${dryRun ? 'DRY RUN -' : 'EXECUTING'} ${phase.name}`);
    console.log("=".repeat(50));
    
    let successCount = 0;
    
    for (const [index, tx] of phase.transactions.entries()) {
      console.log(`\n${index + 1}/${phase.transactions.length}: ${tx.description}`);
      
      if (dryRun) {
        try {
          // Simulate the transaction
          await this.vestingContract.addVesting.staticCall(...tx.params);
          console.log("   ✅ Simulation successful");
          successCount++;
        } catch (error) {
          console.log(`   ❌ Simulation failed: ${error}`);
        }
      } else {
        try {
          // Execute actual transaction
          const txResponse = await this.vestingContract.addVesting(...tx.params);
          console.log(`   📡 Transaction: ${txResponse.hash}`);
          
          const receipt = await txResponse.wait();
          console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
          console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
          successCount++;
          
          // Wait between transactions to avoid nonce issues
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.log(`   ❌ Transaction failed: ${error}`);
        }
      }
    }
    
    console.log(`\n📊 Phase Results: ${successCount}/${phase.transactions.length} successful`);
    return successCount === phase.transactions.length;
  }

  async executeFullPlan(dryRun: boolean = true): Promise<void> {
    console.log(`\n🎬 ${dryRun ? 'DRY RUN -' : 'EXECUTING'} Full Vesting Schedule Setup`);
    console.log("=".repeat(60));
    
    const validation = await this.validateSchedules();
    if (!validation.isValid) {
      console.error("❌ Cannot proceed - validation failed");
      return;
    }
    
    const plan = await this.createExecutionPlan();
    
    if (!dryRun) {
      console.log("\n⚠️  EXECUTION CONFIRMATION REQUIRED");
      console.log("===================================");
      console.log("This will set up ALL vesting schedules");
      console.log(`Estimated cost: ${plan.estimatedCost} ETH`);
      console.log(`Estimated time: ${plan.timeEstimate}`);
      console.log("\nProceed? Set CONFIRM_EXECUTION=true to continue");
      
      if (process.env.CONFIRM_EXECUTION !== "true") {
        console.log("🛑 Execution cancelled. Set CONFIRM_EXECUTION=true to proceed.");
        return;
      }
    }
    
    let allSuccess = true;
    
    for (const phase of plan.phases) {
      if (phase.transactions.length === 0) continue;
      
      const phaseSuccess = await this.executePhase(phase, dryRun);
      allSuccess = allSuccess && phaseSuccess;
      
      if (!phaseSuccess && !dryRun) {
        console.log("❌ Phase failed - stopping execution");
        break;
      }
    }
    
    if (allSuccess) {
      console.log("\n🎉 All phases completed successfully!");
      await this.generateScheduleReport();
    } else {
      console.log("\n❌ Some phases failed - review logs above");
    }
  }

  async generateScheduleReport() {
    console.log("\n📋 Generating Schedule Report...");
    
    const report = {
      timestamp: new Date().toISOString(),
      network: (await ethers.provider.getNetwork()).name,
      vestingContract: await this.vestingContract.getAddress(),
      treasury: this.treasuryAddress,
      schedules: this.schedules.map(schedule => ({
        category: schedule.categoryName,
        totalAllocation: ethers.formatEther(schedule.totalAllocation),
        maxAllocation: ethers.formatEther(schedule.maxAllocation),
        utilization: `${Number(schedule.totalAllocation * 100n / schedule.maxAllocation)}%`,
        beneficiaryCount: schedule.beneficiaries.length,
        beneficiaries: schedule.beneficiaries.map(b => ({
          address: b.address,
          amount: ethers.formatEther(b.amount),
          cliffDays: b.cliff,
          durationDays: b.duration,
          description: b.description
        }))
      }))
    };
    
    console.log("\n📊 VESTING SCHEDULE REPORT");
    console.log("==========================");
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

async function main() {
  const vestingAddress = process.env.VESTING_CONTRACT_ADDRESS || "";
  const treasuryAddress = process.env.TREASURY_SAFE_ADDRESS || "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38";
  const dryRun = process.env.DRY_RUN !== "false"; // Default to dry run

  if (!vestingAddress) {
    console.error("❌ VESTING_CONTRACT_ADDRESS environment variable required");
    process.exit(1);
  }

  const orchestrator = new VestingScheduleOrchestrator(vestingAddress, treasuryAddress);
  
  try {
    await orchestrator.initialize(vestingAddress);
    await orchestrator.executeFullPlan(dryRun);
    
  } catch (error) {
    console.error("💥 Critical Error:", error);
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

export { VestingScheduleOrchestrator, VestingSchedule, BeneficiaryConfig };
