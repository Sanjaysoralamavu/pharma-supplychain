const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const PharmaSupplyChain = await hre.ethers.getContractFactory("PharmaSupplyChain");
  const contract = await PharmaSupplyChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PharmaSupplyChain deployed to:", address);

  // Assign demo roles to test accounts (local only)
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    const signers = await hre.ethers.getSigners();
    const Role = { Manufacturer: 1, Distributor: 2, Pharmacy: 3, Regulator: 4 };

    await contract.assignRole(signers[1].address, Role.Manufacturer);
    await contract.assignRole(signers[2].address, Role.Distributor);
    await contract.assignRole(signers[3].address, Role.Pharmacy);
    console.log("Demo roles assigned:");
    console.log("  Manufacturer:", signers[1].address);
    console.log("  Distributor: ", signers[2].address);
    console.log("  Pharmacy:    ", signers[3].address);
    console.log("  Regulator:   ", deployer.address);
  }

  const fs = require("fs");
  fs.writeFileSync("deployment.json", JSON.stringify({
    network: hre.network.name,
    contractAddress: address,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  }, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main().catch((err) => { console.error(err); process.exit(1); });
