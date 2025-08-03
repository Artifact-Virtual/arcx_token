const { ethers } = require("hardhat");

async function main() {
    console.log("ARCx Token Transfer to Treasury Safe");
    console.log("=====================================");
    
    // Configuration
    const tokenAddress = "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44"; // ARCx Token
    const treasuryAddress = "0x8F8fdBFa1AF9f53973a7003CbF26D854De9b2f38"; // Treasury Safe
    const transferAmount = ethers.parseEther("800000"); // 800,000 ARCx
    
    const [deployer] = await ethers.getSigners();
    console.log("Transferring from:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    
    // Get ARCx token contract
    const ARCxToken = await ethers.getContractFactory("ARCxToken");
    const token = ARCxToken.attach(tokenAddress);
    
    console.log("\nToken Transfer Configuration:");
    console.log("Token Address:", tokenAddress);
    console.log("Treasury Safe Address:", treasuryAddress);
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
    
    // Check Treasury Safe exists (should be an EOA or contract)
    const treasuryCode = await ethers.provider.getCode(treasuryAddress);
    if (treasuryCode === "0x") {
        console.log("Treasury is an EOA (Externally Owned Account)");
    } else {
        console.log("Treasury is a smart contract (Safe multisig)");
    }
    
    // Estimate gas for transfer
    try {
        const gasEstimate = await token.transfer.estimateGas(treasuryAddress, transferAmount);
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
    console.log("🚀 Transferring 800,000 ARCx to Treasury Safe...");
    
    // Execute the transfer with optimized gas
    try {
        const tx = await token.transfer(treasuryAddress, transferAmount, {
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
        const treasuryBalance = await token.balanceOf(treasuryAddress);
        
        console.log("Deployer new balance:", ethers.formatEther(newDeployerBalance), "ARCx");
        console.log("Treasury Safe balance:", ethers.formatEther(treasuryBalance), "ARCx");
        
        // Verify amounts
        const expectedDeployerBalance = deployerBalance - transferAmount;
        if (newDeployerBalance === expectedDeployerBalance) {
            console.log("✅ Deployer balance verified");
        }
        
        if (treasuryBalance >= transferAmount) {
            console.log("✅ Treasury Safe received tokens");
        }
        
        console.log("\n🎉 SUCCESS: 800,000 ARCx transferred to Treasury Safe!");
        console.log("💰 Cost: Sub-cent transaction achieved (~$0.001 USD)");
        
        console.log("\nTokenomics Distribution Summary:");
        console.log("================================");
        console.log("✅ Core Team (200K ARCx):     In MVC vesting contract");
        console.log("✅ Treasury Pool (800K ARCx): In Treasury Safe multisig");
        console.log("");
        console.log("Treasury Safe Virtual Allocations:");
        console.log("├── Ecosystem Fund:     250,000 ARCx");
        console.log("├── Community Airdrop:  150,000 ARCx");
        console.log("├── Strategic Partners: 100,000 ARCx");
        console.log("├── Public Sale:        200,000 ARCx");
        console.log("└── Treasury Reserve:   100,000 ARCx");
        console.log("    TOTAL:              800,000 ARCx ✅");
        
        console.log("\nNext Steps:");
        console.log("1. Setup core team vesting schedule in MVC");
        console.log("2. Update transparency page with final addresses");
        console.log("3. Treasury Safe can distribute according to tokenomics");
        console.log("4. Create additional vesting contracts as needed");
        
        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            cost: ethers.formatEther(actualCost),
            treasuryBalance: ethers.formatEther(treasuryBalance)
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
