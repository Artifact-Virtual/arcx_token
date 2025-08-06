describe("Admin Controls", function () {
    it("Should allow admin to pause auction", async function () {
        await auction.pause();
        expect(await auction.paused()).to.be.true;
        
        await time.increaseTo(auctionStartTime + 1);
        await expect(
            auction.connect(buyer1).purchaseTokens({ value: ethers.parseEther("1") })
        ).to.be.reverted;
    });

    it("Should allow admin to unpause auction", async function () {
        await auction.pause();
        await auction.unpause();
        expect(await auction.paused()).to.be.false;
    });
});
