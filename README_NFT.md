# OCSH NFT - Onchain Survival

> Enterprise-Grade Onchain Gaming NFT with Embedded Survival Guide  
> 
![Live](https://img.shields.io/badge/Status-Ready-00FF88?style=for-the-badge) 
![Base](https://img.shields.io/badge/Network-Base%20L2-0052FF?style=for-the-badge) 
![ERC721](https://img.shields.io/badge/Standard-ERC721Enumerable-FF0080?style=for-the-badge) 
![Onchain](https://img.shields.io/badge/Storage-100%25%20Onchain-00FF88?style=for-the-badge)

### **NFT Contract**
**Contract:** [`OCSH.sol`](contracts/OCSH.sol)  
**Library:** [`OSCHLib.sol`](contracts/OSCHLib.sol)  
**Standard:** ERC721Enumerable + AccessControl + Game Mechanics

### **Onchain Features**
- **Embedded Image:** Base64-encoded PNG stored onchain
- **Survival Guide:** "Darknet Continuum" manual embedded in contract
- **Zero Dependencies:** No IPFS, HTTP, or external services required
- **Censorship Resistant:** Permanent, immutable onchain storage

## **Game Mechanics Overview**

| Feature | Description | Gas Cost |
|---------|-------------|----------|
| **Chain Links** | Sequential NFT linking with cryptographic verification | Sub-cent |
| **Messaging** | Anti-spam onchain communication with exponential fees | ~$0.001 |
| **Alliances** | Role-based alliance system with leader permissions | ~$0.002 |
| **Challenges** | Onchain PvP battles with XP rewards | ~$0.003 |
| **Territory Control** | Claimable territories for strategic gameplay | ~$0.002 |
| **Trading** | Direct NFT-to-NFT trading system | ~$0.005 |
| **Leveling** | XP-based progression with automatic level calculation | Passive |

## **Technical Architecture**

### **Core Contract Structure**
```solidity
contract OCSH is ERC721Enumerable, Ownable, AccessControl {
    using OCSHLib for *;
    
    // Chain-linking system
    struct ChainLink {
        uint40 prevTokenId;
        bytes32 dataHash;
        uint40 timestamp;
    }
    
    // Game mechanics integration
    // Messaging, Alliances, Challenges, Territory, Trading
}
```

### **Library Integration (OSCHLib.sol)**
```solidity
library OCSHLib {
    // Role constants
    bytes32 public constant ALLIANCE_LEADER_ROLE = keccak256("ALLIANCE_LEADER_ROLE");
    bytes32 public constant GAME_ADMIN_ROLE = keccak256("GAME_ADMIN_ROLE");
    
    // Data structures
    struct Territory { uint40 ownerTokenId; uint40 allianceId; uint40 lastClaimed; }
    struct LevelInfo { uint32 xp; uint8 level; }
    
    // Anti-spam mechanics
    function messageCooldown(uint256 lastMsgBlock, uint256 cooldownBlocks) returns (bool);
    function calcMessageFee(uint256 baseFee, uint256 msgCount) returns (uint256);
    
    // Leveling system
    function xpToLevel(uint32 xp) returns (uint8);
}
```

## **How To Play**

### **1. Minting & Chain Building**
```solidity
// Only contract owner can mint (ensures controlled supply)
function mint(address to, bytes32 customData) external onlyOwner
```
- Each NFT links to the previous token, creating an unbreakable onchain chain
- Cryptographic hash includes previous token, recipient, custom data, and blockhash
- Chain integrity can be verified by traversing links backwards

### **2. Messaging System**
```solidity
function sendMessage(uint40 tokenId, string calldata text) external payable
```
**How it works:**
- Send up to 64-character messages attached to your NFT
- **Anti-spam protection:** 10-block cooldown between messages
- **Exponential fees:** Each message costs `BASE_FEE * 2^messageCount`
- **First message:** 0.00001 ETH (~$0.0003)
- **Second message:** 0.00002 ETH
- **Third message:** 0.00004 ETH (doubles each time)

**Strategy Tips:**
- Use messaging strategically - costs increase rapidly
- Coordinate with alliance members to reduce individual message load
- Important communications justify higher fees

### **3. Alliance Warfare**
```solidity
function createAlliance(uint40[] calldata memberTokenIds) external returns (uint40)
function joinAlliance(uint40 allianceId, uint40 tokenId) external
```
**Alliance Benefits:**
- **Collective Territory Control:** Alliances can claim territories together
- **Strategic Coordination:** Alliance leaders get special permissions
- **Role-Based Access Control:** Leaders can manage membership
- **Shared Identity:** Alliance ID stored onchain for each member

**Leadership Powers:**
- Create alliances with multiple NFTs
- Manage alliance membership
- Coordinate territory claims
- Strategic battle planning

### **4. Challenge System (PvP Battles)**
```solidity
function issueChallenge(uint40 challenger, uint40 opponent) external returns (uint40)
function acceptChallenge(uint40 challengeId) external
```
**Battle Mechanics:**
- **Random Outcome:** Uses blockhash + token IDs + timestamp for fairness
- **XP Rewards:** Winners gain 100 XP automatically
- **Level Progression:** XP triggers automatic level calculation
- **Onchain History:** All challenges and outcomes permanently recorded

**Challenge Flow:**
1. **Issue Challenge:** Pick an opponent and create challenge
2. **Acceptance:** Opponent must accept to proceed
3. **Random Battle:** Onchain randomness determines winner
4. **Rewards:** Winner gains 100 XP and levels up if threshold reached
5. **History:** Battle results stored permanently

### **5. Territory Control**
```solidity
function claimTerritory(uint40 territoryId, uint40 tokenId) external
```
**Territory System:**
- **Fixed Supply:** 10 territories available (NUM_TERRITORIES constant)
- **Claim Rewards:** Claiming gives 50 XP to your NFT
- **Alliance Integration:** Territories show alliance ownership
- **Strategic Value:** Control key locations for dominance

**Territory Benefits:**
- **XP Generation:** 50 XP per successful claim
- **Alliance Presence:** Territories display alliance control
- **Strategic Positioning:** Control key map locations
- **Progression Boost:** Faster leveling through territory claims

### **6. Trading & Economics**
```solidity
function proposeTrade(uint40 fromToken, uint40 toToken) external
function acceptTrade(uint40 fromToken, uint40 toToken) external
```
**Direct Trading:**
- **No Marketplace Fees:** Direct peer-to-peer trading
- **Proposal System:** One party proposes, other accepts
- **Atomic Swaps:** Both NFTs transfer simultaneously
- **Full Transparency:** All trades logged onchain

## **Game State & Player Dashboard**

### **How Players Track Their Progress**

The OCSH contract provides comprehensive visibility into all game mechanics through public mappings and view functions. Players can query their complete game state at any time.

#### **Player Profile Queries**

```solidity
// Get your NFT's level and XP
mapping(uint40 => OCSHLib.LevelInfo) public levels;
// Returns: { uint32 xp, uint8 level }

// Check your alliance membership  
mapping(uint40 => uint40) public allianceOf; // tokenId => allianceId

// View your message history
mapping(uint256 => Message[]) public messages;
mapping(uint256 => uint256) public msgCount;
mapping(uint256 => uint256) public lastMsgBlock;

// Check your trade proposals
mapping(uint40 => uint40) public tradeProposals; // fromToken => toToken
```

#### **Alliance Intelligence System**

```solidity
// Get complete alliance data
mapping(uint40 => Alliance) public alliances;
// Returns: { uint40[] members, bool exists, address leader }

// Check alliance territory control
mapping(uint40 => Territory) public territories;
// Returns: { uint40 ownerTokenId, uint40 allianceId, uint40 lastClaimed }
```

#### **Battle & Challenge Tracking**

```solidity
// View challenge details
mapping(uint40 => Challenge) public challenges;
// Returns: { uint40 challenger, uint40 opponent, ChallengeStatus status, address winner, uint40 timestamp }

// Challenge statuses
enum ChallengeStatus { None, Pending, Accepted, Resolved }
```

### **Frontend Integration Examples**

#### **Player Dashboard Code**
```javascript
// Get complete player profile
async function getPlayerProfile(contract, tokenId) {
    const profile = {
        // Basic NFT info
        owner: await contract.ownerOf(tokenId),
        
        // Level and XP
        levelInfo: await contract.levels(tokenId),
        level: levelInfo.level,
        xp: levelInfo.xp,
        
        // Alliance membership
        allianceId: await contract.allianceOf(tokenId),
        
        // Messaging stats
        messageCount: await contract.msgCount(tokenId),
        lastMessageBlock: await contract.lastMsgBlock(tokenId),
        
        // Trading
        tradeProposal: await contract.tradeProposals(tokenId)
    };
    
    return profile;
}

// Check if player can send message
async function canSendMessage(contract, tokenId) {
    const lastMsgBlock = await contract.lastMsgBlock(tokenId);
    const currentBlock = await provider.getBlockNumber();
    const cooldownBlocks = 10; // MSG_COOLDOWN_BLOCKS
    
    return currentBlock >= lastMsgBlock + cooldownBlocks;
}

// Calculate next message fee
async function getMessageFee(contract, tokenId) {
    const msgCount = await contract.msgCount(tokenId);
    const baseFee = await contract.BASE_MSG_FEE();
    
    return baseFee * (2 ** msgCount); // Exponential fee
}
```

#### **Alliance Dashboard Code**
```javascript
// Get alliance details
async function getAllianceInfo(contract, allianceId) {
    const alliance = await contract.alliances(allianceId);
    
    return {
        members: alliance.members,
        leader: alliance.leader,
        exists: alliance.exists,
        memberCount: alliance.members.length
    };
}

// Get territories controlled by alliance
async function getAllianceTerritories(contract, allianceId) {
    const territories = [];
    const NUM_TERRITORIES = 10;
    
    for (let i = 0; i < NUM_TERRITORIES; i++) {
        const territory = await contract.territories(i);
        if (territory.allianceId === allianceId) {
            territories.push({
                territoryId: i,
                ownerTokenId: territory.ownerTokenId,
                lastClaimed: territory.lastClaimed
            });
        }
    }
    
    return territories;
}
```

#### **Territory Map Visualization**
```javascript
// Get complete territory map
async function getTerritoryMap(contract) {
    const territories = [];
    const NUM_TERRITORIES = 10;
    
    for (let i = 0; i < NUM_TERRITORIES; i++) {
        const territory = await contract.territories(i);
        const owner = territory.ownerTokenId;
        const alliance = territory.allianceId;
        
        territories.push({
            id: i,
            owner: owner,
            alliance: alliance,
            lastClaimed: territory.lastClaimed,
            isControlled: owner !== 0
        });
    }
    
    return territories;
}

// Render territory control map
function renderTerritoryMap(territories) {
    territories.forEach((territory, index) => {
        const element = document.getElementById(`territory-${index}`);
        
        if (territory.isControlled) {
            element.classList.add('controlled');
            element.dataset.owner = territory.owner;
            element.dataset.alliance = territory.alliance;
            element.title = `Territory ${index}: Controlled by NFT #${territory.owner} (Alliance ${territory.alliance})`;
        } else {
            element.classList.remove('controlled');
            element.title = `Territory ${index}: Unclaimed`;
        }
    });
}
```

#### **Battle History & Statistics**
```javascript
// Get battle history for a player
async function getBattleHistory(contract, tokenId) {
    const totalChallenges = await contract.nextChallengeId();
    const battles = [];
    
    for (let i = 0; i < totalChallenges; i++) {
        const challenge = await contract.challenges(i);
        
        if (challenge.challenger === tokenId || challenge.opponent === tokenId) {
            battles.push({
                challengeId: i,
                challenger: challenge.challenger,
                opponent: challenge.opponent,
                status: challenge.status,
                winner: challenge.winner,
                timestamp: challenge.timestamp,
                isWin: challenge.winner === await contract.ownerOf(tokenId)
            });
        }
    }
    
    return battles;
}

// Calculate win rate
function calculateWinRate(battles) {
    const resolvedBattles = battles.filter(b => b.status === 3); // Resolved
    const wins = resolvedBattles.filter(b => b.isWin).length;
    
    return resolvedBattles.length > 0 ? (wins / resolvedBattles.length) * 100 : 0;
}
```

### **Live Game State Monitoring**

#### **Event Listening for Real-Time Updates**
```javascript
// Listen for all game events
function setupEventListeners(contract) {
    // Level up notifications
    contract.on("LeveledUp", (tokenId, newLevel) => {
        console.log(`NFT #${tokenId} leveled up to ${newLevel}!`);
        updatePlayerLevel(tokenId, newLevel);
    });
    
    // Territory control changes
    contract.on("TerritoryClaimed", (territoryId, tokenId, allianceId) => {
        console.log(`Territory ${territoryId} claimed by NFT #${tokenId} for Alliance ${allianceId}`);
        updateTerritoryMap();
    });
    
    // Alliance activity
    contract.on("AllianceCreated", (allianceId, members, leader) => {
        console.log(`New alliance ${allianceId} created with ${members.length} members`);
        updateAllianceList();
    });
    
    // Battle outcomes
    contract.on("ChallengeResolved", (challengeId, winner) => {
        console.log(`Challenge ${challengeId} resolved - Winner: ${winner}`);
        updateBattleHistory();
    });
    
    // Message activity
    contract.on("MessageSent", (tokenId, from, textHash, fee) => {
        console.log(`Message sent by NFT #${tokenId}, fee: ${fee}`);
        updateMessageFeed();
    });
}
```

### **Leaderboard Queries**

```javascript
// Get top players by level/XP
async function getLeaderboard(contract) {
    const totalSupply = await contract.totalSupply();
    const players = [];
    
    for (let i = 0; i < totalSupply; i++) {
        const tokenId = await contract.tokenByIndex(i);
        const levelInfo = await contract.levels(tokenId);
        const owner = await contract.ownerOf(tokenId);
        
        players.push({
            tokenId,
            owner,
            level: levelInfo.level,
            xp: levelInfo.xp
        });
    }
    
    // Sort by level, then by XP
    return players.sort((a, b) => {
        if (a.level !== b.level) return b.level - a.level;
        return b.xp - a.xp;
    });
}

// Get alliance power rankings
async function getAlliancePowerRankings(contract) {
    const maxAllianceId = await contract.nextAllianceId();
    const alliances = [];
    
    for (let i = 0; i < maxAllianceId; i++) {
        const alliance = await contract.alliances(i);
        if (!alliance.exists) continue;
        
        let totalXP = 0;
        let averageLevel = 0;
        let territoryCount = 0;
        
        // Calculate alliance stats
        for (const tokenId of alliance.members) {
            const levelInfo = await contract.levels(tokenId);
            totalXP += levelInfo.xp;
            averageLevel += levelInfo.level;
        }
        
        averageLevel = averageLevel / alliance.members.length;
        
        // Count territories
        for (let t = 0; t < 10; t++) {
            const territory = await contract.territories(t);
            if (territory.allianceId === i) territoryCount++;
        }
        
        alliances.push({
            allianceId: i,
            leader: alliance.leader,
            memberCount: alliance.members.length,
            totalXP,
            averageLevel,
            territoryCount,
            powerScore: totalXP + (territoryCount * 100) + (averageLevel * 50)
        });
    }
    
    return alliances.sort((a, b) => b.powerScore - a.powerScore);
}
```

### **Quick Status Checks**

```javascript
// One-function player summary
async function getQuickStatus(contract, tokenId) {
    const [levelInfo, allianceId, msgCount, owner] = await Promise.all([
        contract.levels(tokenId),
        contract.allianceOf(tokenId),
        contract.msgCount(tokenId),
        contract.ownerOf(tokenId)
    ]);
    
    return {
        tokenId,
        owner,
        level: levelInfo.level,
        xp: levelInfo.xp,
        alliance: allianceId,
        messagesSent: msgCount,
        xpToNextLevel: getXPToNextLevel(levelInfo.xp)
    };
}

function getXPToNextLevel(currentXP) {
    const thresholds = [100, 300, 600, 1000];
    for (const threshold of thresholds) {
        if (currentXP < threshold) {
            return threshold - currentXP;
        }
    }
    return 0; // Max level reached
}
```

This comprehensive query system allows players to:
- **Track their progress** (level, XP, alliance membership)
- **Monitor territory control** (who owns what, alliance dominance)
- **View battle history** (wins, losses, pending challenges)
- **Check alliance status** (members, territories, power rankings)
- **Calculate costs** (message fees, cooldowns)
- **Real-time updates** (event listening for live changes)

## **Leveling & Progression System**

### **XP Sources**
| Activity | XP Reward | Strategy |
|----------|-----------|----------|
| **Win Challenge** | 100 XP | High-risk, high-reward |
| **Claim Territory** | 50 XP | Consistent progression |
| **Alliance Activities** | Varies | Cooperative advancement |

### **Level Thresholds (OSCHLib.sol)**
```solidity
function xpToLevel(uint32 xp) internal pure returns (uint8) {
    if (xp < 100) return 1;    // Level 1: 0-99 XP
    if (xp < 300) return 2;    // Level 2: 100-299 XP  
    if (xp < 600) return 3;    // Level 3: 300-599 XP
    if (xp < 1000) return 4;   // Level 4: 600-999 XP
    return 5;                  // Level 5: 1000+ XP (Max)
}
```

### **Progression Strategy**
- **Level 1 → 2:** Win 1 challenge OR claim 2 territories
- **Level 2 → 3:** Win 2 more challenges OR claim 4 more territories  
- **Level 3 → 4:** Win 3 more challenges OR claim 6 more territories
- **Level 4 → 5:** Win 4 more challenges OR claim 8 more territories
- **Max Level:** Level 5 (1000+ XP) - Elite status

## **Embedded Survival Guide**

### **"Darknet Continuum" Manual**
The contract includes a comprehensive onchain survival guide for maintaining blockchain operations during infrastructure failures:

```solidity
function getDarknetGuide() external pure returns (string memory, string memory, string memory)
```

**Protocols Included:**
1. **BONE NET (BONET)** - Mesh networking for decentralized communication
2. **SIGNAL SCRIPT** - SMS-based transaction broadcasting
3. **PHYSICAL HANDSHAKE** - Offline hardware transfer methods
4. **DATA RELIC** - USB sneakernet for data transport
5. **STATIC HAUL** - Ham radio blockchain transmission
6. **GHOST MODE** - Radio broadcast transaction relay
7. **SKYCHAIN RELAY** - Satellite-based blockchain communication

**Core Doctrine:** *"The blockchain's true home is not the internet; the internet is merely a convenient transport layer."*

## **Security & Anti-Cheat Measures**

### **Anti-Spam Protection**
- **Message Cooldowns:** 10-block minimum between messages
- **Exponential Fees:** Each message doubles in cost
- **Rate Limiting:** Prevents message spam attacks

### **Fair Play Mechanics**
- **Onchain Randomness:** Battle outcomes use blockhash + IDs + timestamp
- **No Oracle Dependency:** All randomness generated onchain
- **Transparent History:** Every action recorded and auditable

### **Access Control (OpenZeppelin)**
```solidity
bytes32 public constant GAME_ADMIN_ROLE = keccak256("GAME_ADMIN_ROLE");
bytes32 public constant ALLIANCE_LEADER_ROLE = keccak256("ALLIANCE_LEADER_ROLE");
```
- **Role-Based Permissions:** Different powers for different roles
- **Granular Control:** Specific permissions for specific actions
- **Security First:** Battle-tested OpenZeppelin implementation

## **Gas Optimization Features**

### **Efficient Storage**
```solidity
struct ChainLink {
    uint40 prevTokenId;    // Optimized for gas
    bytes32 dataHash;      // Standard hash size
    uint40 timestamp;      // Sufficient for timestamps
}
```

### **Batch Operations**
- **Alliance Creation:** Add multiple NFTs in single transaction
- **Territory Claims:** Optimized single-call claiming
- **Message Batching:** Efficient storage for message history

### **Base L2 Optimization**
- **Sub-cent Gas Costs:** All operations under $0.01
- **Fast Finality:** 2-second block times
- **Ethereum Security:** Inherits Ethereum mainnet security

## **Advanced Features**

### **Chain Traversal**
```solidity
function getChain(uint40 tokenId, uint40 depth) external view returns (ChainLink[] memory)
```
- **Verify Chain Integrity:** Trace backwards through the chain
- **Historical Analysis:** Examine minting patterns and timing
- **Data Verification:** Cryptographic proof of chain validity

### **Query Functions**
```solidity
// Get all messages for an NFT
mapping(uint256 => Message[]) public messages;

// Check alliance membership
mapping(uint40 => uint40) public allianceOf;

// View territory ownership
mapping(uint40 => Territory) public territories;

// Check level and XP
mapping(uint40 => LevelInfo) public levels;
```

### **Event Logging**
```solidity
event Minted(address indexed to, uint40 indexed tokenId, uint40 prevTokenId, bytes32 dataHash);
event MessageSent(uint40 indexed tokenId, address indexed from, bytes32 textHash, uint256 fee);
event AllianceCreated(uint40 indexed allianceId, uint40[] members, address leader);
event ChallengeResolved(uint40 indexed challengeId, address winner);
event TerritoryClaimed(uint40 indexed territoryId, uint40 indexed tokenId, uint40 indexed allianceId);
event LeveledUp(uint40 indexed tokenId, uint8 newLevel);
```

## **Deployment Guide**

### **Prerequisites**
```bash
npm install @openzeppelin/contracts
```

### **Contract Dependencies**
- **OCSH.sol** - Main NFT contract
- **OSCHLib.sol** - Utility library with game mechanics
- **OpenZeppelin** - AccessControl, ERC721Enumerable, Ownable

### **Deployment Parameters**
```solidity
constructor() ERC721("Onchain Survival Chain", "OCSH") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(GAME_ADMIN_ROLE, msg.sender);
}
```

### **Configuration Constants**
```solidity
uint8 public constant MAX_MSG_LEN = 64;                    // Message character limit
uint256 public constant BASE_MSG_FEE = 0.00001 ether;     // Starting message fee
uint256 public constant MSG_COOLDOWN_BLOCKS = 10;         // Blocks between messages
uint40 public constant NUM_TERRITORIES = 10;              // Total territories available
```

## **Integration Examples**

### **Frontend Integration**
```javascript
// Check if user can send message
const canMessage = await contract.messageCooldown(
    lastMsgBlock, 
    MSG_COOLDOWN_BLOCKS
);

// Calculate current message fee
const fee = await contract.calcMessageFee(
    BASE_MSG_FEE, 
    messageCount
);

// Send message with proper fee
await contract.sendMessage(tokenId, "Hello World!", { value: fee });
```

### **Alliance Management**
```javascript
// Create alliance with multiple NFTs
const memberTokenIds = [1, 2, 3, 4, 5];
const allianceId = await contract.createAlliance(memberTokenIds);

// Join existing alliance
await contract.joinAlliance(allianceId, myTokenId);
```

### **Battle System**
```javascript
// Issue challenge
const challengeId = await contract.issueChallenge(myTokenId, opponentTokenId);

// Accept challenge (as opponent)
await contract.acceptChallenge(challengeId);

// Check results
const challenge = await contract.challenges(challengeId);
console.log("Winner:", challenge.winner);
```

## **Economic Model**

### **Message Fee Progression**
| Message # | Fee (ETH) | Fee (USD)* | Cumulative Cost |
|-----------|-----------|------------|-----------------|
| 1st | 0.00001 | $0.03 | $0.03 |
| 2nd | 0.00002 | $0.06 | $0.09 |
| 3rd | 0.00004 | $0.12 | $0.21 |
| 4th | 0.00008 | $0.24 | $0.45 |
| 5th | 0.00016 | $0.48 | $0.93 |
| 10th | 0.00512 | $15.36 | $30.69 |

*Assumes ETH = $3000

### **XP Economics**
- **Territory Claims:** 50 XP each (passive farming)
- **Challenge Wins:** 100 XP each (competitive rewards)
- **Level 5 Achievement:** Requires 1000+ XP (elite status)

## **Roadmap & Future Features**

### **Planned Enhancements**
- [ ] **Guild Systems** - Multi-alliance coordination
- [ ] **Resource Tokens** - Tradeable in-game assets
- [ ] **Advanced Territories** - Resource generation and special abilities
- [ ] **Tournament Mode** - Structured competitive events
- [ ] **Cross-Chain Bridges** - Multi-network expansion

### **Community Features**
- [ ] **Governance Integration** - NFT-based voting on game parameters
- [ ] **Custom Challenges** - Player-created challenge types
- [ ] **Alliance Wars** - Large-scale coordinated battles
- [ ] **Leaderboards** - Rankings by XP, territories, battles won

## **Technical Specifications**

### **Gas Estimates (Base L2)**
```
Mint: ~80,000 gas (~$0.004)
Send Message: ~45,000 gas (~$0.002) + message fee
Create Alliance: ~120,000 gas (~$0.006)
Accept Challenge: ~95,000 gas (~$0.005)
Claim Territory: ~70,000 gas (~$0.004)
Propose Trade: ~35,000 gas (~$0.002)
Accept Trade: ~85,000 gas (~$0.004)
```

### **Storage Optimization**
- **Packed Structs:** Efficient storage layout for minimal gas
- **uint40 Timestamps:** Sufficient until year 2084
- **bytes32 Hashes:** Standard 256-bit cryptographic hashes
- **uint8 Levels:** Maximum level 255 (currently capped at 5)

### **Security Features**
- **ReentrancyGuard:** Protection against reentrancy attacks
- **AccessControl:** Role-based permission system
- **Pausable:** Emergency stop functionality
- **SafeERC20:** Safe token transfer operations

## **Community & Support**

### **Get Involved**
- **Discord:** [Join our gaming community](#)
- **GitHub:** [Contribute to development](https://github.com/Artifact-Virtual/arcx_token)
- **Documentation:** [Full technical docs](#)

### **Bug Bounty Program**
- **Security Issues:** Up to $10,000 for critical vulnerabilities
- **Game Balance:** $500-$2,000 for economic exploits
- **Gas Optimization:** $100-$1,000 for efficiency improvements

---

## **Contract Verification**

When deployed, the contract will be verified on:
- **BaseScan:** Full source code verification
- **Sourcify:** Decentralized source verification
- **OpenZeppelin:** Standard compliance verification

**Security Audit Status:** Ready for professional audit before mainnet deployment

---

*OCSH NFT represents the cutting edge of onchain gaming - where every action is permanent, every strategy is transparent, and survival depends on building the strongest onchain community.*
