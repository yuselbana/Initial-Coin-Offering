const {ethers}= require("hardhat");
require ("dotenv").config({path:".env"});
const {MIKU_NFT_CONTRACT_ADDRESS} = require("../constants/index");
async function main() {
  const mikuNFTContract = MIKU_NFT_CONTRACT_ADDRESS;
  const mikuNFTTokenContract = await ethers.getContractFactory("MikuToken");
  const deployedNMikuNFTTokenContract = await mikuNFTTokenContract.deploy(mikuNFTContract);
  console.log("Miku Token Contract Address", deployedNMikuNFTTokenContract.address);
}
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});