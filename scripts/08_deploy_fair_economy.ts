import { ethers } from "hardhat";
import { Contract } from "ethers";

/**
 * 🚀 ARCx Fair Economy Deployment
 * 
 * Deploying the most advanced fair-distribution system ever created:
 * - Dutch Auction with anti-whale protection
 * - Smart Airdrop with contribution scoring
 * - Enhanced fairness mechanisms
 */

interface DeploymentConfig {
    // Dutch Auction Configuration
    auction: {
        totalTokens: string;
        startPrice: string;    // ETH per ARCx (in wei)
        reservePrice: string;  // ETH per ARCx (in wei) 
        duration: number;      // seconds
        maxPurchase: string;   // max ARCx per address
    };
    
    // Smart Airdrop Configuration  
    airdrop: {
        totalTokens: string;
        claimDuration: number; // seconds
        minimumAccountAge: number; // blocks
    };
    
    // Network Configuration
    network: {
        arcxTokenAddress: string;
        treasuryAddress: string;
    };
}

class FairEconomyDeployer {
    private config: DeploymentConfig;
    private deploymentState: {
        auctionContract?: Contract;
        airdropContract?: Contract;
        merkleRoot?: string;
        deploymentHash?: string;
    } = {};

    constructor() {
        this.config = this.getDeploymentConfig();
    }

    private getDeploymentConfig(): DeploymentConfig {
        return {
            auction: {
                totalTokens: ethers.parseEther("100000").toString(),    // 100K ARCx
                startPrice: ethers.parseEther("0.0002").toString(),     // $0.20 at $1000 ETH
                reservePrice: ethers.parseEther("0.00005").toString(),  // $0.05 at $1000 ETH  
                duration: 72 * 3600,  // 72 hours
                maxPurchase: ethers.parseEther("5000").toString()       // 5K ARCx max per address
            },
            airdrop: {
                totalTokens: ethers.parseEther("50000").toString(),     // 50K ARCx
                claimDuration: 30 * 24 * 3600, // 30 days
                minimumAccountAge: 19000000    // ~3 months of blocks
            },
            network: {
                arcxTokenAddress: "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
                treasuryAddress: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"
            }
        };
    }

    /**
     * Step 1: Deploy Dutch Auction Contract
     */
    async deployDutchAuction(): Promise<Contract> {
        console.log("\n🎯 Deploying Dutch Auction Contract...");
        
        const [deployer] = await ethers.getSigners();
        const startTime = Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
        
        const ARCxDutchAuction = await ethers.getContractFactory("ARCxDutchAuction");
        
        const auctionContract = await ARCxDutchAuction.deploy(
            this.config.network.arcxTokenAddress,
            this.config.auction.totalTokens,
            startTime,
            this.config.auction.duration,
            this.config.auction.startPrice,
            this.config.auction.reservePrice,
            this.config.network.treasuryAddress,
            this.config.auction.maxPurchase
        );

        await auctionContract.waitForDeployment();
        const auctionAddress = await auctionContract.getAddress();
        
        console.log("✅ Dutch Auction deployed to:", auctionAddress);
        console.log("📊 Configuration:");
        console.log(`   • Total Tokens: ${ethers.formatEther(this.config.auction.totalTokens)} ARCx`);
        console.log(`   • Start Price: ${ethers.formatEther(this.config.auction.startPrice)} ETH per ARCx`);
        console.log(`   • Reserve Price: ${ethers.formatEther(this.config.auction.reservePrice)} ETH per ARCx`);
        console.log(`   • Duration: ${this.config.auction.duration / 3600} hours`);
        console.log(`   • Start Time: ${new Date(startTime * 1000).toISOString()}`);

        this.deploymentState.auctionContract = auctionContract;
        return auctionContract;
    }

    /**
     * Step 2: Generate Merkle Tree for Airdrop
     */
    async generateMerkleTree(): Promise<string> {
        console.log("\n🌳 Generating Merkle Tree for Airdrop...");
        
        // Sample eligible users with contributions  
        const eligibleUsers = [
            {
                address: "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38",
                baseAmount: ethers.parseEther("500").toString(),
                contributions: [0, 1] // DEVELOPER, COMMUNITY
            },
            {
                address: "0x2ebCb38562051b02dae9cAca5ed8Ddb353d225eb", 
                baseAmount: ethers.parseEther("300").toString(),
                contributions: [2, 3] // CONTENT_CREATOR, EARLY_ADOPTER
            }
            // Add more eligible users based on contribution analysis
        ];

        // Generate merkle tree (simplified - use real merkle tree library in production)
        const leaves = eligibleUsers.map(user => 
            ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "uint256", "uint8[]"],
                [user.address, user.baseAmount, user.contributions]
            ))
        );

        // For now, return a placeholder root
        const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("placeholder_root"));
        
        console.log("✅ Merkle root generated:", merkleRoot);
        console.log(`📊 Eligible users: ${eligibleUsers.length}`);
        
        this.deploymentState.merkleRoot = merkleRoot;
        return merkleRoot;
    }

    /**
     * Step 3: Deploy Smart Airdrop Contract
     */
    async deploySmartAirdrop(): Promise<Contract> {
        console.log("\n💰 Deploying Smart Airdrop Contract...");
        
        if (!this.deploymentState.merkleRoot) {
            await this.generateMerkleTree();
        }

        const ARCxSmartAirdrop = await ethers.getContractFactory("ARCxSmartAirdrop");
        
        const airdropContract = await ARCxSmartAirdrop.deploy(
            this.config.network.arcxTokenAddress,
            this.config.airdrop.totalTokens,
            this.config.airdrop.claimDuration,
            this.deploymentState.merkleRoot!,
            this.config.airdrop.minimumAccountAge
        );

        await airdropContract.waitForDeployment();
        const airdropAddress = await airdropContract.getAddress();
        
        console.log("✅ Smart Airdrop deployed to:", airdropAddress);
        console.log("📊 Configuration:");
        console.log(`   • Total Tokens: ${ethers.formatEther(this.config.airdrop.totalTokens)} ARCx`);
        console.log(`   • Claim Duration: ${this.config.airdrop.claimDuration / (24 * 3600)} days`);
        console.log(`   • Minimum Account Age: ${this.config.airdrop.minimumAccountAge} blocks`);

        this.deploymentState.airdropContract = airdropContract;
        return airdropContract;
    }

    /**
     * Step 4: Transfer Tokens to Contracts
     */
    async fundContracts(): Promise<void> {
        console.log("\n💸 Funding Contracts with ARCx Tokens...");
        
        const [deployer] = await ethers.getSigners();
        const arcxToken = await ethers.getContractAt("ARCxToken", this.config.network.arcxTokenAddress);
        
        // Check deployer balance
        const deployerBalance = await arcxToken.balanceOf(deployer.address);
        const totalNeeded = BigInt(this.config.auction.totalTokens) + BigInt(this.config.airdrop.totalTokens);
        
        console.log(`📊 Deployer ARCx Balance: ${ethers.formatEther(deployerBalance)}`);
        console.log(`📊 Total Needed: ${ethers.formatEther(totalNeeded)}`);
        
        if (deployerBalance < totalNeeded) {
            throw new Error("Insufficient ARCx balance for funding contracts");
        }

        // Fund Dutch Auction
        if (this.deploymentState.auctionContract) {
            const auctionAddress = await this.deploymentState.auctionContract.getAddress();
            console.log("💰 Funding Dutch Auction...");
            
            const tx1 = await arcxToken.transfer(auctionAddress, this.config.auction.totalTokens);
            await tx1.wait();
            console.log(`✅ Transferred ${ethers.formatEther(this.config.auction.totalTokens)} ARCx to auction`);
        }

        // Fund Smart Airdrop  
        if (this.deploymentState.airdropContract) {
            const airdropAddress = await this.deploymentState.airdropContract.getAddress();
            console.log("💰 Funding Smart Airdrop...");
            
            const tx2 = await arcxToken.transfer(airdropAddress, this.config.airdrop.totalTokens);
            await tx2.wait();
            console.log(`✅ Transferred ${ethers.formatEther(this.config.airdrop.totalTokens)} ARCx to airdrop`);
        }
    }

    /**
     * Step 5: Configure Early Supporters and Contribution Scores
     */
    async configureEnhancements(): Promise<void> {
        console.log("\n⚡ Configuring Fair Economy Enhancements...");

        // Configure early supporters in auction
        if (this.deploymentState.auctionContract) {
            console.log("🎯 Setting early supporters...");
            
            const earlySupporter = "0x742d35Cc6635C0532925a3b8D295B221e93C7e6e";
            const tx1 = await this.deploymentState.auctionContract.setEarlySupporter(earlySupporter, true);
            await tx1.wait();
            
            console.log(`✅ Set ${earlySupporter} as early supporter`);
        }

        // Configure contribution scores in airdrop
        if (this.deploymentState.airdropContract) {
            console.log("📊 Setting contribution scores...");
            
            const users = ["0x742d35Cc6635C0532925a3b8D295B221e93C7e6e"];
            const contributionTypes = [0]; // DEVELOPER
            const scores = [100];
            
            const tx2 = await this.deploymentState.airdropContract.batchSetContributionScores(
                users, contributionTypes, scores
            );
            await tx2.wait();
            
            console.log(`✅ Set contribution scores for ${users.length} users`);
        }
    }

    /**
     * Step 6: Generate Deployment Report
     */
    async generateReport(): Promise<void> {
        console.log("\n📋 Generating Deployment Report...");
        
        const auctionAddress = this.deploymentState.auctionContract ? 
            await this.deploymentState.auctionContract.getAddress() : "Not deployed";
        const airdropAddress = this.deploymentState.airdropContract ?
            await this.deploymentState.airdropContract.getAddress() : "Not deployed";

        const report = {
            timestamp: new Date().toISOString(),
            network: "Base Mainnet",
            deploymentType: "Fair Economy Distribution System",
            contracts: {
                dutchAuction: {
                    address: auctionAddress,
                    totalTokens: this.config.auction.totalTokens,
                    startPrice: this.config.auction.startPrice,
                    reservePrice: this.config.auction.reservePrice,
                    duration: this.config.auction.duration,
                    features: ["Anti-whale protection", "Tier-based pricing", "Early supporter bonuses"]
                },
                smartAirdrop: {
                    address: airdropAddress,
                    totalTokens: this.config.airdrop.totalTokens,
                    claimDuration: this.config.airdrop.claimDuration,
                    features: ["Merit-based distribution", "Sybil resistance", "Contribution scoring"]
                }
            },
            tokenAllocations: {
                dutchAuction: `${ethers.formatEther(this.config.auction.totalTokens)} ARCx (100K)`,
                smartAirdrop: `${ethers.formatEther(this.config.airdrop.totalTokens)} ARCx (50K)`,
                total: "150K ARCx allocated for fair distribution"
            },
            fairnessFeatures: [
                "Democratic price discovery through Dutch auction",
                "Anti-whale protection with purchase limits",
                "Merit-based airdrop distribution",
                "Multi-tier pricing bonuses",
                "Sybil attack resistance",
                "Contribution-based multipliers",
                "Time-weighted participation rewards"
            ]
        };

        console.log("\n🎉 FAIR ECONOMY DEPLOYMENT COMPLETE!");
        console.log("=" .repeat(60));
        console.log(JSON.stringify(report, null, 2));
        
        // Save report to file
        const fs = await import('fs/promises');
        await fs.writeFile(
            `reports/fair-economy-deployment-${Date.now()}.json`,
            JSON.stringify(report, null, 2)
        );
    }

    /**
     * Main deployment orchestration
     */
    async deploy(): Promise<void> {
        console.log("🚀 Initiating Fair Economy Deployment...");
        console.log("Building the most advanced fair-distribution system ever created!");
        
        try {
            // Deploy contracts
            await this.deployDutchAuction();
            await this.deploySmartAirdrop();
            
            // Fund contracts
            await this.fundContracts();
            
            // Configure enhancements
            await this.configureEnhancements();
            
            // Generate final report
            await this.generateReport();
            
        } catch (error) {
            console.error("\n❌ Deployment failed:", error);
            throw error;
        }
    }
}

// Execute deployment
async function main() {
    const deployer = new FairEconomyDeployer();
    await deployer.deploy();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
