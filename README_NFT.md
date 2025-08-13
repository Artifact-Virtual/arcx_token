# OCSH NFT Technical Reference

## Overview
- **Type:** ERC721Enumerable NFT
- **Purpose:** Onchain, self-extending NFT chain with integrated game and social mechanics
- **Design:** Sub-cent gas, modular, security-first, fully onchain

## Core Features
- **Chain-Linked NFTs:**
  - Each NFT references the previous token, forming a verifiable onchain chain.
  - `ChainLink` struct: `prevTokenId`, `dataHash`, `timestamp`.
- **Minting:**
  - Only contract owner can mint.
  - Each mint stores a new chain link with cryptographic hash.

## Messaging (Anti-Spam)
- NFT holders can send onchain messages (max 64 chars, hashed).
- Messaging is rate-limited (cooldown per token, 10 blocks).
- Message fee increases exponentially with message count per token.
- All messages are stored and indexed by tokenId.

## Alliances (RBAC)
- Alliances are groups of NFTs, each with a leader (RBAC enforced).
- Only alliance leaders can manage alliance membership.
- Alliances are tracked by `allianceId` and store member tokenIds.

## Challenges & Leveling
- NFT holders can issue and accept onchain challenges (battles).
- Challenge outcome is determined by onchain randomness (blockhash, tokenIds, timestamp).
- Winners gain experience points (XP); XP determines NFT level.
- Leveling is automatic based on XP thresholds.

## Territory Control
- Fixed set of territories (10 by default).
- Territories can be claimed by NFTs or alliances.
- Claiming a territory increases NFT XP and may affect alliance status.
- All territory changes are logged onchain.

## Trading & Gifting
- Direct, onchain NFT-for-NFT trades between holders.
- Trades are proposed and must be accepted by the counterparty.
- All trades are logged and transparent.

## Security & Transparency
- Uses OpenZeppelin AccessControl for granular permissions.
- All actions are logged with events for full auditability.
- All state and history are accessible via public view functions.

## Modularity
- Utility and game logic is factored into `functions.lib.sol` for maintainability and extensibility.

## Storage & Gas Optimization
- Uses small types (`uint40`, `bytes32`) for storage efficiency.
- All logic is designed for minimal gas usage per action.

## Extensibility
- The contract is structured for easy addition of new game mechanics, roles, or features.

## No Offchain Dependencies
- All data, logic, and history are fully onchain and censorship-resistant.
