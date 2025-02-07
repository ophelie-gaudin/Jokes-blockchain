import { ethers } from "hardhat";

async function main() {
  const DadJokeNFT = await ethers.getContractFactory("DadJokeNFT");
  const dadJokeNFT = await DadJokeNFT.deploy();
  await dadJokeNFT.waitForDeployment();

  const address = await dadJokeNFT.getAddress();
  console.log("DadJokeNFT deployed to:", address);
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
