import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying CeloWork Escrow Contract to Celo Alfajores...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO\n");

  // Deploy CeloWorkEscrow
  console.log("Deploying CeloWorkEscrow...");
  const CeloWorkEscrow = await ethers.getContractFactory("CeloWorkEscrow");
  const escrow = await CeloWorkEscrow.deploy();
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("✅ CeloWorkEscrow deployed to:", escrowAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "alfajores",
    contractName: "CeloWorkEscrow",
    contractAddress: escrowAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, "alfajores.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📝 Deployment info saved to:", deploymentPath);
  console.log("\n🔗 View on Celoscan:");
  console.log(`https://alfajores.celoscan.io/address/${escrowAddress}`);
  console.log("\n✨ Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Verify the contract: npm run verify");
  console.log("2. Update SDK config with contract address");
  console.log("3. Test the contract with demo app");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
