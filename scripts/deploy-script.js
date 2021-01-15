const hre = require("hardhat");

async function main() {
  const IssueRedeem = await ethers.getContractFactory("IssueRedeem")
  const issueRedeem = await IssueRedeem.deploy()
  await issueRedeem.deployed();
  console.log("deployed to:", issueRedeem.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
