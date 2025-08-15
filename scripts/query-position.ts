import { ethers } from "hardhat";
import { utils, BigNumber } from "ethers";
import { CONTRACTS } from "./shared/constants";

async function main() {
  const provider = ethers.provider;
  const POSITION_MANAGER = CONTRACTS.POSITION_MANAGER;
  const tokenId = 134827;

  console.log(`Querying Position Manager ${POSITION_MANAGER} for tokenId ${tokenId}...`);

  // Minimal ERC721 ABI
  const erc721 = new ethers.Interface(["function ownerOf(uint256) view returns (address)", "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)", "function tokenURI(uint256) view returns (string)"]);
  const contract = new ethers.Contract(POSITION_MANAGER, erc721, provider);

  try {
    const owner = await contract.ownerOf(tokenId);
    console.log(`Owner: ${owner}`);
  } catch (e) {
    console.log(`ownerOf call failed: ${String(e)}`);
  }

  // Fetch Transfer logs for this tokenId
  const transferTopic = utils.id("Transfer(address,address,uint256)");
  const tokenIdTopic = utils.hexZeroPad(BigNumber.from(tokenId).toHexString(), 32);

  console.log("Fetching Transfer logs for tokenId (this may take a few seconds)...");
  const logs = await provider.getLogs({
    address: POSITION_MANAGER,
    topics: [transferTopic, null, null, tokenIdTopic],
    fromBlock: 0,
    toBlock: 'latest',
  });

  if (logs.length === 0) {
    console.log("No Transfer logs found for this tokenId.");
  } else {
    console.log(`Found ${logs.length} Transfer log(s). Showing latest 5:`);
    const limited = logs.slice(-5);
    for (const l of limited) {
      console.log(`- tx: https://basescan.org/tx/${l.transactionHash}  block: ${l.blockNumber}`);
    }
  }

  // Try tokenURI
  try {
    const uri = await contract.tokenURI(tokenId);
    console.log(`tokenURI: ${uri}`);
  } catch (e) {
    console.log(`tokenURI call failed or unavailable: ${String(e)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
