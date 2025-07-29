import { expect } from "chai";
import { ethers } from "hardhat";
import { ARCxToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ARCxToken", function () {
    let ARCxToken: any;
    let arcxToken: ARCxToken;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;

    beforeEach(async function () {
        ARCxToken = await ethers.getContractFactory("ARCxToken");
        [owner, addr1, addr2] = await ethers.getSigners();
        arcxToken = await ARCxToken.deploy("ARCx Token", "ARCX", ethers.parseEther("1000000"), owner.address);
        await arcxToken.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await arcxToken.name()).to.equal("ARCx Token");
            expect(await arcxToken.symbol()).to.equal("ARCX");
        });

        it("Should set the correct max supply", async function () {
            expect(await arcxToken.MAX_SUPPLY()).to.equal(ethers.parseEther("1000000"));
        });

        it("Should grant all roles to deployer", async function () {
            const adminRole = await arcxToken.ADMIN_ROLE();
            const minterRole = await arcxToken.MINTER_ROLE();
            const pauserRole = await arcxToken.PAUSER_ROLE();
            
            expect(await arcxToken.hasRole(adminRole, owner.address)).to.be.true;
            expect(await arcxToken.hasRole(minterRole, owner.address)).to.be.true;
            expect(await arcxToken.hasRole(pauserRole, owner.address)).to.be.true;
        });

        it("Should record deployment timestamp", async function () {
            const deployedAt = await arcxToken.deployedAt();
            expect(deployedAt).to.be.greaterThan(0);
        });
    });

    describe("Minting", function () {
        it("Should allow minter to mint tokens", async function () {
            await arcxToken.mint(addr1.address, ethers.parseEther("1000"));
            expect(await arcxToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
        });

        it("Should not allow minting beyond max supply", async function () {
            await expect(arcxToken.mint(addr1.address, ethers.parseEther("1000001")))
                .to.be.revertedWith("Exceeds max supply");
        });

        it("Should not allow minting after finalization", async function () {
            await arcxToken.finalizeMinting();
            await expect(arcxToken.mint(addr1.address, ethers.parseEther("1000")))
                .to.be.revertedWith("Minting has been finalized");
        });

        it("Should not allow non-minter to mint", async function () {
            await expect(arcxToken.connect(addr1).mint(addr2.address, ethers.parseEther("1000")))
                .to.be.reverted;
        });

        it("Should emit MintFinalized event when finalized", async function () {
            await expect(arcxToken.finalizeMinting())
                .to.emit(arcxToken, "MintFinalized");
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            await arcxToken.mint(addr1.address, ethers.parseEther("1000"));
        });

        it("Should allow token holders to burn tokens", async function () {
            await arcxToken.connect(addr1).burn(ethers.parseEther("500"));
            expect(await arcxToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("500"));
        });

        it("Should allow burning to fuel when bridge is set", async function () {
            await arcxToken.setFuelBridge(addr2.address);
            await arcxToken.connect(addr1).burnToFuel(ethers.parseEther("500"));
            expect(await arcxToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("500"));
        });

        it("Should not allow burning to fuel when bridge is not set", async function () {
            await expect(arcxToken.connect(addr1).burnToFuel(ethers.parseEther("500")))
                .to.be.revertedWith("Bridge not set");
        });

        it("Should not allow burning to fuel when paused", async function () {
            await arcxToken.setFuelBridge(addr2.address);
            await arcxToken.pause();
            await expect(arcxToken.connect(addr1).burnToFuel(ethers.parseEther("500")))
                .to.be.revertedWith("Pausable: paused");
        });
    });

    describe("Bridge functionality", function () {
        it("Should allow admin to set fuel bridge", async function () {
            await arcxToken.setFuelBridge(addr2.address);
            expect(await arcxToken.fuelBridge()).to.equal(addr2.address);
        });

        it("Should not allow setting zero address as bridge", async function () {
            await expect(arcxToken.setFuelBridge(ethers.ZeroAddress))
                .to.be.revertedWith("Invalid address");
        });

        it("Should not allow setting bridge twice", async function () {
            await arcxToken.setFuelBridge(addr2.address);
            await arcxToken.lockBridgeAddress();
            await expect(arcxToken.setFuelBridge(addr1.address))
                .to.be.revertedWith("Operation already finalized");
        });

        it("Should emit events when bridge is set and locked", async function () {
            await expect(arcxToken.setFuelBridge(addr2.address))
                .to.emit(arcxToken, "BridgeAddressSet")
                .withArgs(addr2.address);

            await expect(arcxToken.lockBridgeAddress())
                .to.emit(arcxToken, "BridgeLocked");
        });

        it("Should not allow non-admin to set bridge", async function () {
            await expect(arcxToken.connect(addr1).setFuelBridge(addr2.address))
                .to.be.reverted;
        });
    });

    describe("Pausable", function () {
        beforeEach(async function () {
            await arcxToken.mint(addr1.address, ethers.parseEther("1000"));
        });

        it("Should allow pauser to pause transfers", async function () {
            await arcxToken.pause();
            await expect(arcxToken.connect(addr1).transfer(addr2.address, ethers.parseEther("100")))
                .to.be.revertedWith("Pausable: paused");
        });

        it("Should allow pauser to unpause", async function () {
            await arcxToken.pause();
            await arcxToken.unpause();
            await arcxToken.connect(addr1).transfer(addr2.address, ethers.parseEther("100"));
            expect(await arcxToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("100"));
        });

        it("Should not allow non-pauser to pause", async function () {
            await expect(arcxToken.connect(addr1).pause())
                .to.be.reverted;
        });
    });

    describe("Access Control", function () {
        it("Should allow admin to grant roles", async function () {
            const minterRole = await arcxToken.MINTER_ROLE();
            await arcxToken.grantRole(minterRole, addr1.address);
            expect(await arcxToken.hasRole(minterRole, addr1.address)).to.be.true;
        });

        it("Should allow admin to revoke roles", async function () {
            const minterRole = await arcxToken.MINTER_ROLE();
            await arcxToken.grantRole(minterRole, addr1.address);
            await arcxToken.revokeRole(minterRole, addr1.address);
            expect(await arcxToken.hasRole(minterRole, addr1.address)).to.be.false;
        });

        it("Should prevent operations without proper roles", async function () {
            await expect(arcxToken.connect(addr1).finalizeMinting())
                .to.be.revertedWith("Restricted to admins");
        });
    });

    describe("ERC20 Standard Compliance", function () {
        beforeEach(async function () {
            await arcxToken.mint(owner.address, ethers.parseEther("1000"));
        });

        it("Should transfer tokens between accounts", async function () {
            await arcxToken.transfer(addr1.address, ethers.parseEther("50"));
            expect(await arcxToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
            expect(await arcxToken.balanceOf(owner.address)).to.equal(ethers.parseEther("950"));
        });

        it("Should approve and transfer from", async function () {
            await arcxToken.approve(addr1.address, ethers.parseEther("100"));
            await arcxToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("50"));
            expect(await arcxToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("50"));
            expect(await arcxToken.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("50"));
        });

        it("Should fail transfer when insufficient balance", async function () {
            await expect(arcxToken.transfer(addr1.address, ethers.parseEther("2000")))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
    });
});
