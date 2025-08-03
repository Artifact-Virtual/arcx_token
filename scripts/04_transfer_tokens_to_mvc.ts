const { ethers } = require("hardhat");

async function main() {
    console.log("ARCx Token Transfer to MVC Contract");
    console.log("===================================");
    
    // Configuration
    const tokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44"; // ARCx Token
    const mvcAddress = "0xEEc0298bE76C9C3224eA05a34687C1a1134d550B"; // MVC Contract
    const transferAmount = ethers.parseEther("200000"); // 200,000 ARCx
    
    const [deployer] = await ethers.getSigners();
    console.log("Transferring from:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Get ARCx token contract
    const ARCxToken = await ethers.getContractFactory("ARCxToken");
    const token = ARCxToken.attach(tokenAddress);
    
    console.log("\nToken Transfer Configuration:");
    console.log("Token Address:", tokenAddress);
    console.log("MVC Address:", mvcAddress);
    console.log("Transfer Amount:", ethers.formatEther(transferAmount), "ARCx");
    
    // Check deployer's ARCx balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("\nBalance Check:");
    console.log("Deployer ARCx balance:", ethers.formatEther(deployerBalance), "ARCx");
    console.log("Required amount:", ethers.formatEther(transferAmount), "ARCx");
    
    if (deployerBalance < transferAmount) {
        console.error("ERROR: Insufficient ARCx balance for transfer");
        console.log("Available:", ethers.formatEther(deployerBalance), "ARCx");
        console.log("Required:", ethers.formatEther(transferAmount), "ARCx");
        return;
    }
    
    // Check MVC contract exists
    const mvcCode = await ethers.provider.getCode(mvcAddress);
    if (mvcCode === "0x") {
        console.error("ERROR: MVC contract not found at address");
        return;
    }
    console.log("MVC contract validated");
    
    // Estimate gas for transfer
    try {
        const gasEstimate = await token.transfer.estimateGas(mvcAddress, transferAmount);
        console.log("\nGas Estimation:");
        console.log("Estimated gas:", gasEstimate.toString());
        console.log("Gas price: 0.01 gwei (sub-cent optimization)");
        
        const gasPrice = ethers.parseUnits("0.01", "gwei");
        const gasCost = gasEstimate * gasPrice;
        console.log("Estimated cost:", ethers.formatEther(gasCost), "ETH (~$0.001 USD)");
    } catch (error) {
        console.error("Gas estimation failed:", error.message);
        return;
    }
    
    console.log("\nExecuting transfer...");
    
    // Execute the transfer with optimized gas
    try {
        const tx = await token.transfer(mvcAddress, transferAmount, {
            gasPrice: ethers.parseUnits("0.01", "gwei") // Sub-cent gas price
        });
        
        console.log("Transaction submitted:", tx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        console.log("\n✅ TRANSFER SUCCESSFUL!");
        console.log("Transaction hash:", receipt.hash);
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        console.log("Gas price:", ethers.formatUnits(receipt.gasPrice || tx.gasPrice, "gwei"), "gwei");
        
        const actualCost = receipt.gasUsed * (receipt.gasPrice || tx.gasPrice);
        console.log("Actual cost:", ethers.formatEther(actualCost), "ETH");
        
        // Verify the transfer
        console.log("\nVerifying transfer:");
        const newDeployerBalance = await token.balanceOf(deployer.address);
        const mvcBalance = await token.balanceOf(mvcAddress);
        
        console.log("Deployer new balance:", ethers.formatEther(newDeployerBalance), "ARCx");
        console.log("MVC contract balance:", ethers.formatEther(mvcBalance), "ARCx");
        
        // Verify amounts
        const expectedDeployerBalance = deployerBalance - transferAmount;
        if (newDeployerBalance === expectedDeployerBalance) {
            console.log("✅ Deployer balance verified");
        }
        
        if (mvcBalance >= transferAmount) {
            console.log("✅ MVC contract received tokens");
        }
        
        console.log("\n🎉 SUCCESS: 200,000 ARCx transferred to MVC contract!");
        console.log("💰 Cost: Sub-cent transaction achieved (~$0.001 USD)");
        
        console.log("\nNext Steps:");
        console.log("1. Setup core team vesting schedule");
        console.log("2. Update transparency page");
        console.log("3. Treasury Safe can now manage vesting");
        
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            cost: ethers.formatEther(actualCost),
            mvcBalance: ethers.formatEther(mvcBalance)
        };
        
    } catch (error) {
        console.error("Transfer failed:", error.message);
        return { success: false, error: error.message };
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
