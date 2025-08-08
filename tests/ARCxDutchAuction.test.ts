import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ARCxDutchAuction", function () {
  let token: any;
  let auction: any;
  let owner: any;
  let buyer1: any;

  const TOTAL_AUCTION_TOKENS = ethers.parseEther("1000");
  const START_PRICE = ethers.parseEther("0.001"); // 0.001 ETH per ARCx
  const RESERVE_PRICE = ethers.parseEther("0.0002");
  const DURATION = 3600; // 1 hour
  const MAX_PER_ADDRESS = ethers.parseEther("1000");

  let auctionStartTime: number;

  beforeEach(async () => {
    [owner, buyer1] = await ethers.getSigners();

    const TokenF = await ethers.getContractFactory("ARCxToken");
    token = await TokenF.deploy("ARCx Token", "ARCX", ethers.parseEther("1000000"), owner.address);
    await token.waitForDeployment();

    auctionStartTime = (await time.latest()) + 10; // starts in 10s

    const AuctionF = await ethers.getContractFactory("ARCxDutchAuction");
    auction = await AuctionF.deploy(
      await token.getAddress(),
      TOTAL_AUCTION_TOKENS,
      auctionStartTime,
      DURATION,
      START_PRICE,
      RESERVE_PRICE,
      owner.address, // treasury
      MAX_PER_ADDRESS
    );
    await auction.waitForDeployment();

    // Fund auction with tokens
    await token.mint(await auction.getAddress(), TOTAL_AUCTION_TOKENS);
  });

  it("Should allow admin to pause and unpause auction", async function () {
    await auction.pause();
    expect(await auction.paused()).to.equal(true);

    // After start, purchases should revert when paused
    await time.increaseTo(auctionStartTime + 1);
    await expect(auction.connect(buyer1).purchaseTokens({ value: ethers.parseEther("0.1") })).to.be.reverted;

    await auction.unpause();
    expect(await auction.paused()).to.equal(false);
  });

  it("Should allow purchase after start and transfer tokens", async function () {
    await time.increaseTo(auctionStartTime + 1);

    const buyerBefore = await token.balanceOf(buyer1.address);

    const tx = await auction.connect(buyer1).purchaseTokens({ value: ethers.parseEther("0.01") });
    await tx.wait();

    const buyerAfter = await token.balanceOf(buyer1.address);
    expect(buyerAfter).to.be.gt(buyerBefore);

    const status = await auction.getAuctionStatus();
    expect(status._tokensSold).to.be.gt(0n);
  });
});
