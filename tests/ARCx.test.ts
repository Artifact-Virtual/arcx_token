import { expect } from "chai";
import { ethers } from "hardhat";

describe("ARCxToken", function () {
    let ARCxToken;
    let arcxToken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        ARCxToken = await ethers.getContractFactory("ARCxToken");
        [owner, addr1, addr2] = await ethers.getSigners();
        // Constructor: name, symbol, cap, deployer
        arcxToken = await ARCxToken.deploy("ARCx Token", "ARCX", ethers.parseEther("1000000"), owner.address);
        await arcxToken.waitForDeployment();
        
        // Mint some tokens to owner for testing
        await arcxToken.mint(owner.address, ethers.parseEther("1000"));
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await arcxToken.name()).to.equal("ARCx Token");
            expect(await arcxToken.symbol()).to.equal("ARCX");
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await arcxToken.balanceOf(owner.address);
            expect(await arcxToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            await arcxToken.transfer(addr1.address, 50);
            const addr1Balance = await arcxToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            await arcxToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await arcxToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const initialOwnerBalance = await arcxToken.balanceOf(owner.address);
            await expect(
                arcxToken.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

            // Owner balance shouldn't have changed
            expect(await arcxToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });
    });

    describe("Allowances", function () {
        it("Should approve tokens for delegated transfer", async function () {
            await arcxToken.approve(addr1.address, 100);
            const allowance = await arcxToken.allowance(owner.address, addr1.address);
            expect(allowance).to.equal(100);
        });

        it("Should transfer tokens on behalf of the owner", async function () {
            await arcxToken.approve(addr1.address, 100);
            await arcxToken.connect(addr1).transferFrom(owner.address, addr2.address, 100);
            const addr2Balance = await arcxToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(100);
        });
    });
});