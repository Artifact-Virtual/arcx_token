// scripts/lp-history.ts
// LP transaction forensics: find approvals, transfers, and interactions with Uniswap V4 infra

import { ethers } from "hardhat";
import { CONTRACTS } from "./shared/constants";
import { displayScriptHeader, formatTimestamp } from "./shared/utils";

// Helpers
const TOPIC_APPROVAL = ethers.id("Approval(address,address,uint256)");
const TOPIC_TRANSFER = ethers.id("Transfer(address,address,uint256)");

interface RangeOpts {
  fromBlock?: number;
  toBlock?: number;
  days?: number; // optional convenience arg
}

function topicAddress(topic: string): string {
  // topics are 32-byte padded; last 20 bytes are the address
  const sliced = ethers.dataSlice(topic, 12);
  return ethers.getAddress(sliced);
}

async function resolveRange(opts: RangeOpts): Promise<{ fromBlock: number; toBlock: number }> {
  const latest = await ethers.provider.getBlockNumber();
  const toBlock = opts.toBlock ?? latest;
  if (opts.fromBlock) return { fromBlock: opts.fromBlock, toBlock };
  const approxBlocksPerDay = Math.floor((24 * 60 * 60) / 2); // ~2s blocks on Base
  const lookbackDays = opts.days ?? 7;
  const span = approxBlocksPerDay * lookbackDays;
  const fromBlock = Math.max(0, toBlock - span);
  return { fromBlock, toBlock };
}

async function getLogsChunked(filter: { address?: string | string[]; topics?: (string | null)[]; fromBlock: number; toBlock: number }) {
  const chunk = 50_000;
  const results: any[] = [];
  for (let start = filter.fromBlock; start <= filter.toBlock; start += chunk) {
    const end = Math.min(start + chunk - 1, filter.toBlock);
    const logs = await ethers.provider.getLogs({ address: filter.address as any, topics: filter.topics as any, fromBlock: start, toBlock: end });
    results.push(...logs);
  }
  return results;
}

function fmtAmt(v: bigint, decimals = 18) {
  try { return ethers.formatUnits(v, decimals); } catch { return v.toString(); }
}

async function safeGetBlockTs(blockNumber: number): Promise<string> {
  try {
    const blk = await ethers.provider.getBlock(blockNumber);
    return formatTimestamp(Number(blk?.timestamp ?? 0));
  } catch {
    return "n/a";
  }
}

async function main() {
  displayScriptHeader("ARCx LP Transaction Forensics", "Approvals, transfers, and infra interactions");

  // Parse args (Hardhat run does not forward script args reliably; using defaults)
  const range = await resolveRange({});
  console.log(`\nScan Range: blocks ${range.fromBlock} -> ${range.toBlock}`);

  const TREASURY = CONTRACTS.TREASURY_SAFE;
  const ARCX = CONTRACTS.ARCX_TOKEN;
  const WETH = CONTRACTS.WETH_BASE;
  const POSITION_MANAGER = CONTRACTS.POSITION_MANAGER;
  const POOL_MANAGER = CONTRACTS.POOL_MANAGER;
  const UNIVERSAL_ROUTER = CONTRACTS.UNIVERSAL_ROUTER;

  // Approvals (Treasury -> PositionManager)
  console.log("\nApprovals (Treasury -> Position Manager)");
  try {
    for (const token of [ARCX, WETH]) {
      const approvals = await getLogsChunked({
        address: token,
        topics: [TOPIC_APPROVAL, ethers.zeroPadValue(TREASURY, 32), ethers.zeroPadValue(POSITION_MANAGER, 32)],
        fromBlock: range.fromBlock,
        toBlock: range.toBlock,
      });
      if (approvals.length === 0) {
        console.log(`- ${token}: none`);
      } else {
        for (const log of approvals) {
          const [value] = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
          const owner = topicAddress(log.topics[1]);
          const spender = topicAddress(log.topics[2]);
          const ts = await safeGetBlockTs(log.blockNumber);
          console.log(`- ${token}: owner ${owner} -> spender ${spender} | allowance ${fmtAmt(value)} | block ${log.blockNumber} (${ts}) tx ${log.transactionHash}`);
        }
      }
    }
  } catch (e) {
    console.log(`(approvals section error) ${String(e)}`);
  }

  // Transfers (Treasury -> PositionManager)
  console.log("\nToken Transfers (Treasury -> Position Manager)");
  try {
    for (const token of [ARCX, WETH]) {
      const transfers = await getLogsChunked({
        address: token,
        topics: [TOPIC_TRANSFER, ethers.zeroPadValue(TREASURY, 32), ethers.zeroPadValue(POSITION_MANAGER, 32)],
        fromBlock: range.fromBlock,
        toBlock: range.toBlock,
      });
      if (transfers.length === 0) {
        console.log(`- ${token}: none`);
      } else {
        for (const log of transfers) {
          const [value] = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
          const from = topicAddress(log.topics[1]);
          const to = topicAddress(log.topics[2]);
          const ts = await safeGetBlockTs(log.blockNumber);
          console.log(`- ${token}: ${from} -> ${to} | amount ${fmtAmt(value)} | block ${log.blockNumber} (${ts}) tx ${log.transactionHash}`);
        }
      }
    }
  } catch (e) {
    console.log(`(transfers section error) ${String(e)}`);
  }

  // Position Manager interactions by Treasury (any event)
  console.log("\nPosition Manager interactions (by Treasury)");
  try {
    const pmLogs = await getLogsChunked({ address: POSITION_MANAGER, topics: [], fromBlock: range.fromBlock, toBlock: range.toBlock });
    let pmCount = 0;
    for (const lg of pmLogs) {
      try {
        const tx = await ethers.provider.getTransaction(lg.transactionHash);
        if (tx && tx.from.toLowerCase() === TREASURY.toLowerCase()) {
          const ts = await safeGetBlockTs(lg.blockNumber);
          console.log(`- block ${lg.blockNumber} (${ts}) tx ${lg.transactionHash}`);
          pmCount++;
        }
      } catch {}
    }
    if (pmCount === 0) console.log("- none");
  } catch (e) {
    console.log(`(position manager section error) ${String(e)}`);
  }

  // Pool Manager logs (any sender)
  console.log("\nPool Manager logs in range (any sender)");
  try {
    const poolLogs = await getLogsChunked({ address: POOL_MANAGER, topics: [], fromBlock: range.fromBlock, toBlock: range.toBlock });
    console.log(`- total logs: ${poolLogs.length}`);
    if (poolLogs.length > 0) {
      for (const lg of poolLogs.slice(0, 10)) {
        const ts = await safeGetBlockTs(lg.blockNumber);
        console.log(`  * block ${lg.blockNumber} (${ts}) tx ${lg.transactionHash}`);
      }
      if (poolLogs.length > 10) console.log(`  * ... ${poolLogs.length - 10} more`);
    }
  } catch (e) {
    console.log(`(pool manager section error) ${String(e)}`);
  }

  // Universal Router interactions by Treasury
  console.log("\nUniversal Router interactions (by Treasury)");
  try {
    const urLogs = await getLogsChunked({ address: UNIVERSAL_ROUTER, topics: [], fromBlock: range.fromBlock, toBlock: range.toBlock });
    let urCount = 0;
    for (const lg of urLogs) {
      try {
        const tx = await ethers.provider.getTransaction(lg.transactionHash);
        if (tx && tx.from.toLowerCase() === TREASURY.toLowerCase()) {
          const ts = await safeGetBlockTs(lg.blockNumber);
          console.log(`- block ${lg.blockNumber} (${ts}) tx ${lg.transactionHash}`);
          urCount++;
        }
      } catch {}
    }
    if (urCount === 0) console.log("- none");
  } catch (e) {
    console.log(`(universal router section error) ${String(e)}`);
  }

  console.log("\nSummary");
  console.log("- Approvals indicate allowance set for Position Manager");
  console.log("- Transfers indicate actual token movement during LP mint");
  console.log("- Position Manager entries by Treasury correspond to LP-related ops");
  console.log("- Pool Manager logs volume indicates pool interactions (initialize/mints)");

  console.log("\nDone");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
