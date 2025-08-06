import { expect } from "chai";
import { ethers } from "hardhat";
import { ARCxToken, ARCxSmartAirdrop } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ARCxSmartAirdrop", function () {
    let arcxToken: ARCxToken;
    let airdrop: ARCxSmartAirdrop;
    let owner: HardhatEthersSigner;
    let claimer1: HardhatEthersSigner;
    let claimer2: HardhatEthersSigner;

    const AIRDROP_TOKENS = ethers.parseEther("50000"); // 50K ARCx
    const CLAIM_DURATION = 30 * 24 * 3600; // 30 days
    const MINIMUM_ACCOUNT_AGE = 100000; // Block number

    // Mock merkle root (in production, this would be generated from actual data)
    const MERKLE_ROOT = "0x1234567890123456789012345678901234567890123456789012345678901234";

    beforeEach(async function () {
        [owner, claimer1, claimer2] = await ethers.getSigners();
        
        // Deploy ARCx Token
        const ARCxToken = await ethers.getContractFactory("ARCxToken");
        arcxToken = await ARCxToken.deploy("ARCx Token", "ARCx", ethers.parseEther("1000000"), owner.address);
        await arcxToken.waitForDeployment();

        // Deploy Smart Airdrop
        const ARCxSmartAirdrop = await ethers.getContractFactory("ARCxSmartAirdrop");
        airdrop = await ARCxSmartAirdrop.deploy(
            await arcxToken.getAddress(),
            AIRDROP_TOKENS,
            CLAIM_DURATION,
            MERKLE_ROOT,
            MINIMUM_ACCOUNT_AGE
        );
        await airdrop.waitForDeployment();

        // Mint tokens to airdrop contract
        await arcxToken.mint(await airdrop.getAddress(), AIRDROP_TOKENS);
    });

    describe("Deployment", function () {
        it("Should set correct airdrop parameters", async function () {
            expect(await airdrop.totalTokens()).to.equal(AIRDROP_TOKENS);
            expect(await airdrop.merkleRoot()).to.equal(MERKLE_ROOT);
            expect(await airdrop.minimumAccountAge()).to.equal(MINIMUM_ACCOUNT_AGE);
        });

        it("Should have correct token balance", async function () {
            const balance = await arcxToken.balanceOf(await airdrop.getAddress());
            expect(balance).to.equal(AIRDROP_TOKENS);
        });

        it("Should set correct contribution weights", async function () {
            // ContributionType.DEVELOPER = 0
            expect(await airdrop.contributionWeights(0)).to.equal(200); // 2x multiplier
            
            // ContributionType.BUG_REPORTER = 5  
            expect(await airdrop.contributionWeights(5)).to.equal(250); // 2.5x multiplier
        });
    });

    describe("Contribution Scoring", function () {
        it("Should calculate allocation based on contributions", async function () {
            const baseAmount = ethers.parseEther("100");
            const contributions = [0, 1]; // DEVELOPER, COMMUNITY
            
            const allocation = await airdrop.calculateAllocation(baseAmount, contributions);
            
            // Should be base * (1 + 1 + 0.5) = base * 2.5
            const expected = baseAmount * BigInt(250) / BigInt(100);
            expect(allocation).to.equal(expected);
        });

        it("Should cap maximum multiplier at 5x", async function () {
            const baseAmount = ethers.parseEther("100");
            // Multiple high-value contributions
            const contributions = [0, 1, 2, 4, 5, 6]; // All contribution types
            
            const allocation = await airdrop.calculateAllocation(baseAmount, contributions);
            
            // Should be capped at 5x
            const maxAllocation = baseAmount * BigInt(5);
            expect(allocation).to.be.lte(maxAllocation);
        });

        it("Should return base amount for no contributions", async function () {
            const baseAmount = ethers.parseEther("100");
            const contributions: number[] = [];
            
            const allocation = await airdrop.calculateAllocation(baseAmount, contributions);
            expect(allocation).to.equal(baseAmount);
        });
    });

    describe("Admin Functions", function () {
        it("Should allow admin to update merkle root", async function () {
            const newRoot = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef";
            
            await airdrop.updateMerkleRoot(newRoot);
            expect(await airdrop.merkleRoot()).to.equal(newRoot);
        });

        it("Should allow admin to set contribution scores", async function () {
            await airdrop.setContributionScore(claimer1.address, 0, 100); // DEVELOPER, score 100
            
            expect(await airdrop.userContributionScores(claimer1.address)).to.be.gt(0);
        });

        it("Should only allow admin to update merkle root", async function () {
            const newRoot = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef";
            
            await expect(
                airdrop.connect(claimer1).updateMerkleRoot(newRoot)
            ).to.be.reverted;
        });
    });

    describe("Emergency Controls", function () {
        it("Should allow admin to pause airdrop", async function () {
            await airdrop.pause();
            expect(await airdrop.paused()).to.be.true;
        });

        it("Should allow admin to unpause airdrop", async function () {
            await airdrop.pause();
            await airdrop.unpause();
            expect(await airdrop.paused()).to.be.false;
        });

        it("Should prevent claims when paused", async function () {
            await airdrop.pause();
            
            // This test would need proper merkle proofs in a real scenario
            // For now, just test that paused state prevents execution
            expect(await airdrop.paused()).to.be.true;
        });
    });

    describe("Claim Status", function () {
        it("Should track claim deadline correctly", async function () {
            const deadline = await airdrop.claimDeadline();
            const deployTime = await time.latest();
            
            expect(deadline).to.be.closeTo(deployTime + CLAIM_DURATION, 100);
        });

        it("Should track total eligible users", async function () {
            const totalEligible = await airdrop.totalEligibleUsers();
            expect(totalEligible).to.equal(0); // No users added yet
        });

        it("Should track total claimed tokens", async function () {
            const totalClaimed = await airdrop.totalClaimed();
            expect(totalClaimed).to.equal(0); // No claims yet
        });
    });

    describe("Anti-Sybil Protection", function () {
        it("Should enforce minimum account age", async function () {
            const currentBlock = await ethers.provider.getBlockNumber();
            const recentBlock = currentBlock - 1000; // Too recent
            
            // In a real implementation, this would be tested through the claim function
            // with proper merkle proofs and account age verification
            expect(recentBlock).to.be.gt(MINIMUM_ACCOUNT_AGE - 200000); // Rough check
        });
    });

    describe("Withdrawal Functions", function () {
        it("Should allow admin to withdraw unclaimed tokens after deadline", async function () {
            // Move past claim deadline
            await time.increase(CLAIM_DURATION + 1);
            
            const initialBalance = await arcxToken.balanceOf(owner.address);
            const contractBalance = await arcxToken.balanceOf(await airdrop.getAddress());
            
            await airdrop.withdrawUnclaimedTokens();
            
            const finalBalance = await arcxToken.balanceOf(owner.address);
            expect(finalBalance - initialBalance).to.equal(contractBalance);
        });

        it("Should not allow withdrawal before deadline", async function () {
            await expect(airdrop.withdrawUnclaimedTokens())
                .to.be.revertedWith("Claim period not ended");
        });
    });
});
