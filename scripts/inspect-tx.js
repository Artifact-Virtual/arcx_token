const hre = require('hardhat');
const { ethers } = hre;
const { BigNumber } = require('ethers');
const { CONTRACTS } = require('./shared/constants');

(async ()=>{
  try {
    const provider = ethers.provider;
    const txHash = '0xc1f18f59a1f48314d36d8ea7e5450d172d78c744c5fb4da5b3ac0ae514b7ef4e';
    console.log('Fetching tx', txHash);
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log('block', receipt.blockNumber);
    console.log('tx.value (wei):', tx.value.toString());
    console.log('tx.value (eth):', ethers.formatEther(tx.value));

  // topic hash for Transfer(address,address,uint256): keccak256("Transfer(address,address,uint256)")
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const erc20Iface = new ethers.Interface(["event Transfer(address indexed from, address indexed to, uint256 value)"]);

  // Build token topic for tokenId 134827
  const tokenId = 134827;
  const pad32 = (hex) => { const clean = hex.startsWith('0x') ? hex.slice(2) : hex; return '0x' + clean.padStart(64, '0'); };
  const tokenTopic = pad32('0x' + tokenId.toString(16));

  console.log('Searching receipt logs for NFT Transfer with tokenTopic', tokenTopic);
  const nftLogs = receipt.logs.filter(l => l.topics && l.topics.length >= 4 && l.topics[0] === transferTopic && l.topics[3] === tokenTopic);
  console.log('NFT Transfer logs found:', nftLogs.length);
  for (const l of nftLogs) {
    console.log(`- log address: ${l.address} tx: ${l.transactionHash} block: ${l.blockNumber}`);
  }

  if (nftLogs.length > 0) {
    const nftContract = nftLogs[nftLogs.length-1].address;
    console.log('Querying ownerOf on', nftContract);
    try {
      const nftIface = new ethers.Interface(["function ownerOf(uint256) view returns (address)"]);
      const owner = await provider.call({to: nftContract, data: nftIface.encodeFunctionData('ownerOf', [tokenId])});
      // owner is returned as encoded address; decode
      const decoded = nftIface.decodeFunctionResult('ownerOf', owner);
      console.log('ownerOf result:', decoded[0]);
    } catch(e) { console.error('ownerOf call failed:', e); }
  }

    let arcxTransfers = [];
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === CONTRACTS.ARCX_TOKEN.toLowerCase() && log.topics[0] === transferTopic) {
        const decoded = erc20Iface.parseLog(log);
        arcxTransfers.push({from: decoded.args.from, to: decoded.args.to, value: decoded.args.value.toString()});
      }
    }

    console.log('ARCx transfers in tx:', arcxTransfers.length);
    for (const t of arcxTransfers) console.log(t);

    // Sum ARCx sent to position manager
    const pm = CONTRACTS.POSITION_MANAGER.toLowerCase();
    const totalToPM = arcxTransfers.filter(t=>t.to.toLowerCase()===pm).reduce((acc,t)=>acc.add(BigNumber.from(t.value)), BigNumber.from(0));
    console.log('Total ARCx to Position Manager (wei):', totalToPM.toString());
    console.log('Total ARCx to Position Manager (ARCx):', ethers.formatEther(totalToPM));

  } catch(e){console.error(e)}
})();
