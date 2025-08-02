import { expect } from "chai";
import { ethers } from "hardhat";
import { ARCxMasterVesting, ARCxToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ARCxMasterVesting", function () {
    let arcxToken: ARCxToken;
    let vesting: ARCxMasterVesting;
    let owner: HardhatEthersSigner;
    let treasury: HardhatEthersSigner;
    let beneficiary1: HardhatEthersSigner;
    let beneficiary2: HardhatEthersSigner;
    let beneficiary3: HardhatEthersSigner;

    const TOTAL_SUPPLY = ethers.parseEther("1000000"); // 1M ARCx
    let vestingStartTime: number;

    // Vesting categories enum
    const VestingCategory = {
        CORE_TEAM: 0,
        ECOSYSTEM_FUND: 1,
        COMMUNITY_AIRDROP: 2,
        STRATEGIC_PARTNERS: 3,
        PUBLIC_SALE: 4,
        TREASURY_RESERVE: 5
    };

    beforeEach(async function () {
        [owner, treasury, beneficiary1, beneficiary2, beneficiary3] = await ethers.getSigners();
        
        // Deploy ARCx Token
        const ARCxToken = await ethers.getContractFactory("ARCxToken");
        arcxToken = await ARCxToken.deploy("ARCx Token", "ARCx", TOTAL_SUPPLY, owner.address);
        await arcxToken.waitForDeployment();

        // Set vesting start time to 1 day in the future
        vestingStartTime = (await time.latest()) + 86400; // 24 hours from now

        // Deploy Vesting Contract
        const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
        vesting = await ARCxMasterVesting.deploy(
            await arcxToken.getAddress(),
            treasury.address,
            vestingStartTime
        );
        await vesting.waitForDeployment();

        // Mint tokens to vesting contract
        await arcxToken.mint(await vesting.getAddress(), TOTAL_SUPPLY);
    });

    describe("Deployment", function () {
        it("Should set correct token address", async function () {
            expect(await vesting.token()).to.equal(await arcxToken.getAddress());
        });

        it("Should set correct global vesting start", async function () {
            expect(await vesting.globalVestingStart()).to.equal(vestingStartTime);
        });

        it("Should grant all roles to admin", async function () {
            const adminRole = await vesting.ADMIN_ROLE();
            const vestingManagerRole = await vesting.VESTING_MANAGER_ROLE();
            const pauserRole = await vesting.PAUSER_ROLE();
            
            expect(await vesting.hasRole(adminRole, treasury.address)).to.be.true;
            expect(await vesting.hasRole(vestingManagerRole, treasury.address)).to.be.true;
            expect(await vesting.hasRole(pauserRole, treasury.address)).to.be.true;
        });

        it("Should set correct category allocation limits", async function () {
            const coreTeamStats = await vesting.getCategoryStats(VestingCategory.CORE_TEAM);
            expect(coreTeamStats.maxAllocation).to.equal(ethers.parseEther("200000")); // 20%
            
            const ecosystemStats = await vesting.getCategoryStats(VestingCategory.ECOSYSTEM_FUND);
            expect(ecosystemStats.maxAllocation).to.equal(ethers.parseEther("250000")); // 25%
        });

        it("Should reject invalid constructor parameters", async function () {
            const ARCxMasterVesting = await ethers.getContractFactory("ARCxMasterVesting");
            
            await expect(ARCxMasterVesting.deploy(
                ethers.ZeroAddress,
                treasury.address,
                vestingStartTime
            )).to.be.revertedWith("Invalid token address");

            await expect(ARCxMasterVesting.deploy(
                await arcxToken.getAddress(),
                ethers.ZeroAddress,
                vestingStartTime
            )).to.be.revertedWith("Invalid address");

            const pastTime = (await time.latest()) - 3600;
            await expect(ARCxMasterVesting.deploy(
                await arcxToken.getAddress(),
                treasury.address,
                pastTime
            )).to.be.revertedWith("Start time must be in future");
        });
    });

    describe("Adding Vesting Schedules", function () {
        it("Should add vesting schedule successfully", async function () {
            const amount = ethers.parseEther("10000");
            const cliff = 86400 * 30; // 30 days
            const duration = 86400 * 365; // 1 year
            
            await vesting.connect(treasury).addVesting(
                beneficiary1.address,
                amount,
                0, // Use global start
                cliff,
                duration,
                VestingCategory.CORE_TEAM
            );

            const vestingInfo = await vesting.vestings(beneficiary1.address);
            expect(vestingInfo.totalAmount).to.equal(amount);
            expect(vestingInfo.start).to.equal(vestingStartTime);
            expect(vestingInfo.cliff).to.equal(cliff);
            expect(vestingInfo.duration).to.equal(duration);
            expect(vestingInfo.category).to.equal(VestingCategory.CORE_TEAM);
            expect(vestingInfo.initialized).to.be.true;
        });

        it("Should update category allocations when adding vesting", async function () {
            const amount = ethers.parseEther("50000");
            
            await vesting.connect(treasury).addVesting(
                beneficiary1.address,
                amount,
                0,
                0,
                86400 * 365,
                VestingCategory.CORE_TEAM
            );

            const stats = await vesting.getCategoryStats(VestingCategory.CORE_TEAM);
            expect(stats.allocated).to.equal(amount);
            expect(stats.remaining).to.equal(ethers.parseEther("150000")); // 200k - 50k
        });

        it("Should not allow adding vesting beyond category limits", async function () {
            const excessiveAmount = ethers.parseEther("250001"); // More than 25% limit
            
            await expect(vesting.connect(treasury).addVesting(
                beneficiary1.address,
                excessiveAmount,
                0,
                0,
                86400 * 365,
                VestingCategory.ECOSYSTEM_FUND
            )).to.be.revertedWith("Exceeds category allocation limit");
        });

        it("Should not allow duplicate vesting for same beneficiary", async function () {
            const amount = ethers.parseEther("10000");
            
            await vesting.connect(treasury).addVesting(
                beneficiary1.address,
                amount,
                0,
                0,
                86400 * 365,
                VestingCategory.CORE_TEAM
            );

            await expect(vesting.connect(treasury).addVesting(
                beneficiary1.address,
                amount,
                0,
                0,
                86400 * 365,
                VestingCategory.CORE_TEAM
            )).to.be.revertedWith("Vesting already exists");
        });

        it("Should validate vesting parameters", async function () {
            await expect(vesting.connect(treasury).addVesting(
                beneficiary1.address,
                0, // Zero amount
                0,
                0,
                86400 * 365,
                VestingCategory.CORE_TEAM
            )).to.be.revertedWith("Amount must be greater than zero");

            await expect(vesting.connect(treasury).addVesting(
                beneficiary1.address,
                ethers.parseEther("10000"),
                0,
                0,
                0, // Zero duration
                VestingCategory.CORE_TEAM
            )).to.be.revertedWith("Duration must be greater than zero");

            await expect(vesting.connect(treasury).addVesting(
                beneficiary1.address,
                ethers.parseEther("10000"),
                0,
                86400 * 400, // Cliff longer than duration
                86400 * 365,
                VestingCategory.CORE_TEAM
            )).to.be.revertedWith("Cliff cannot exceed duration");
        });

        it("Should only allow vesting managers to add vesting", async function () {
            await expect(vesting.connect(beneficiary1).addVesting(
                beneficiary2.address,
                ethers.parseEther("10000"),
                0,
                0,
                86400 * 365,
                VestingCategory.CORE_TEAM
            )).to.be.reverted;
        });
    });

    describe("Token Release", function () {
        beforeEach(async function () {
            // Add vesting schedules for testing
            await vesting.connect(treasury).addVesting(
                beneficiary1.address,
                ethers.parseEther("12000"), // 12k tokens
                0,
                86400 * 30, // 30 day cliff
                86400 * 365, // 1 year total
                VestingCategory.CORE_TEAM
            );

            await vesting.connect(treasury).addVesting(
                beneficiary2.address,
                ethers.parseEther("6000"), // 6k tokens
                0,
                0, // No cliff
                86400 * 180, // 6 months total
                VestingCategory.ECOSYSTEM_FUND
            );
        });

        it("Should calculate releasable amount correctly before cliff", async function () {
            // Move to vesting start but before cliff
            await time.increaseTo(vestingStartTime + 86400 * 15); // 15 days after start
            
            expect(await vesting.releasable(beneficiary1.address)).to.equal(0);
            expect(await vesting.releasable(beneficiary2.address)).to.be.greaterThan(0); // No cliff
        });

        it("Should calculate releasable amount correctly after cliff", async function () {
            // Move past cliff period
            await time.increaseTo(vestingStartTime + 86400 * 60); // 60 days after start
            
            const releasable1 = await vesting.releasable(beneficiary1.address);
            expect(releasable1).to.be.greaterThan(0);
            
            // Should be approximately 2 months worth of vesting (60/365 * 12000)
            const expectedAmount = ethers.parseEther("12000") * BigInt(60) / BigInt(365);
            expect(releasable1).to.be.closeTo(expectedAmount, ethers.parseEther("100"));
        });

        it("Should allow beneficiary to release tokens", async function () {
            // Move to middle of vesting period
            await time.increaseTo(vestingStartTime + 86400 * 90); // 3 months
            
            const initialBalance = await arcxToken.balanceOf(beneficiary2.address);
            const releasableAmount = await vesting.releasable(beneficiary2.address);
            
            await vesting.connect(beneficiary2).release();
            
            const finalBalance = await arcxToken.balanceOf(beneficiary2.address);
            expect(finalBalance - initialBalance).to.equal(releasableAmount);
        });

        it("Should update released amount after release", async function () {
            await time.increaseTo(vestingStartTime + 86400 * 90);
            
            const releasableAmount = await vesting.releasable(beneficiary2.address);
            await vesting.connect(beneficiary2).release();
            
            const vestingInfo = await vesting.vestings(beneficiary2.address);
            expect(vestingInfo.released).to.equal(releasableAmount);
        });

        it("Should allow admin to release for beneficiary", async function () {
            await time.increaseTo(vestingStartTime + 86400 * 90);
            
            const initialBalance = await arcxToken.balanceOf(beneficiary1.address);
            await vesting.connect(treasury).releaseFor(beneficiary1.address);
            
            const finalBalance = await arcxToken.balanceOf(beneficiary1.address);
            expect(finalBalance).to.be.greaterThan(initialBalance);
        });

        it("Should release all tokens at end of vesting period", async function () {
            // Move to end of vesting period
            await time.increaseTo(vestingStartTime + 86400 * 365 + 1);
            
            const releasableAmount = await vesting.releasable(beneficiary1.address);
            expect(releasableAmount).to.equal(ethers.parseEther("12000"));
            
            await vesting.connect(beneficiary1).release();
            
            const balance = await arcxToken.balanceOf(beneficiary1.address);
            expect(balance).to.equal(ethers.parseEther("12000"));
        });

        it("Should not allow release when paused", async function () {
            await time.increaseTo(vestingStartTime + 86400 * 90);
            await vesting.connect(treasury).pause();
            
            await expect(vesting.connect(beneficiary2).release())
                .to.be.revertedWith("Pausable: paused");
        });
    });

    describe("Vesting Revocation", function () {
        beforeEach(async function () {
            await vesting.connect(treasury).addVesting(
                beneficiary1.address,
                ethers.parseEther("10000"),
                0,
                0,
                86400 * 365,
                VestingCategory.CORE_TEAM
            );
        });

        it("Should allow admin to revoke vesting", async function () {
            await vesting.connect(treasury).revokeVesting(beneficiary1.address);
            
            const vestingInfo = await vesting.vestings(beneficiary1.address);
            expect(vestingInfo.revoked).to.be.true;
        });

        it("Should prevent release after revocation", async function () {
            await time.increaseTo(vestingStartTime + 86400 * 180);
            await vesting.connect(treasury).revokeVesting(beneficiary1.address);
            
            expect(await vesting.releasable(beneficiary1.address)).to.equal(0);
        });

        it("Should allow admin to restore revoked vesting", async function () {
            await vesting.connect(treasury).revokeVesting(beneficiary1.address);
            await vesting.connect(treasury).restoreVesting(beneficiary1.address);
            
            const vestingInfo = await vesting.vestings(beneficiary1.address);
            expect(vestingInfo.revoked).to.be.false;
        });

        it("Should only allow admin to revoke/restore", async function () {
            await expect(vesting.connect(beneficiary1).revokeVesting(beneficiary1.address))
                .to.be.reverted;
                
            await vesting.connect(treasury).revokeVesting(beneficiary1.address);
            
            await expect(vesting.connect(beneficiary1).restoreVesting(beneficiary1.address))
                .to.be.reverted;
        });
    });

    describe("Administrative Functions", function () {
        it("Should allow admin to update global vesting start", async function () {
            const newStart = vestingStartTime + 86400 * 7; // 1 week later
            
            await vesting.connect(treasury).updateGlobalVestingStart(newStart);
            expect(await vesting.globalVestingStart()).to.equal(newStart);
        });

        it("Should not allow updating vesting start after it has begun", async function () {
            await time.increaseTo(vestingStartTime + 1);
            
            await expect(vesting.connect(treasury).updateGlobalVestingStart(vestingStartTime + 86400))
                .to.be.revertedWith("Vesting already started");
        });

        it("Should allow admin to update category allocations", async function () {
            const newMax = ethers.parseEther("300000");
            
            await vesting.connect(treasury).updateCategoryAllocation(VestingCategory.CORE_TEAM, newMax);
            
            const stats = await vesting.getCategoryStats(VestingCategory.CORE_TEAM);
            expect(stats.maxAllocation).to.equal(newMax);
        });

        it("Should allow emergency withdrawal", async function () {
            const amount = ethers.parseEther("1000");
            const reason = "Emergency fund access";
            
            await vesting.connect(treasury).emergencyWithdraw(owner.address, amount, reason);
            
            const balance = await arcxToken.balanceOf(owner.address);
            expect(balance).to.equal(amount);
        });

        it("Should require reason for emergency withdrawal", async function () {
            await expect(vesting.connect(treasury).emergencyWithdraw(owner.address, ethers.parseEther("1000"), ""))
                .to.be.revertedWith("Reason required");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await vesting.connect(treasury).addVesting(
                beneficiary1.address,
                ethers.parseEther("10000"),
                0,
                0,
                86400 * 365,
                VestingCategory.CORE_TEAM
            );
            
            await vesting.connect(treasury).addVesting(
                beneficiary2.address,
                ethers.parseEther("5000"),
                0,
                0,
                86400 * 180,
                VestingCategory.ECOSYSTEM_FUND
            );
        });

        it("Should return multiple vesting info correctly", async function () {
            const vestings = await vesting.getVestings([beneficiary1.address, beneficiary2.address]);
            
            expect(vestings.length).to.equal(2);
            expect(vestings[0].totalAmount).to.equal(ethers.parseEther("10000"));
            expect(vestings[1].totalAmount).to.equal(ethers.parseEther("5000"));
        });

        it("Should return correct contract stats", async function () {
            const stats = await vesting.getContractStats();
            
            expect(stats.totalAllocated_).to.equal(ethers.parseEther("15000"));
            expect(stats.totalReleased_).to.equal(0);
            expect(stats.contractBalance).to.equal(TOTAL_SUPPLY);
        });
    });
});
