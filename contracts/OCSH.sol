// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./OSCHLib.sol";

/**
 * @title OCSH NFT - Onchain Chain NFT with Game Mechanics, RBAC, Anti-Spam, Territory, Leveling
 * @notice Secure, transparent, and modular NFT game contract.
 */
contract OCSH is ERC721Enumerable, Ownable, AccessControl {
    using OCSHLib for *;

    // --- Roles ---
    bytes32 public constant GAME_ADMIN_ROLE = OCSHLib.GAME_ADMIN_ROLE;
    bytes32 public constant ALLIANCE_LEADER_ROLE = OCSHLib.ALLIANCE_LEADER_ROLE;

    struct ChainLink {
        uint40 prevTokenId;
        bytes32 dataHash;
        uint40 timestamp;
    }
    mapping(uint256 => ChainLink) public chain;
    uint40 public nextTokenId;

    // --- Messaging ---
    struct Message {
        address from;
        bytes32 textHash;
        uint40 timestamp;
    }
    mapping(uint256 => Message[]) public messages;
    mapping(uint256 => uint256) public lastMsgBlock;
    mapping(uint256 => uint256) public msgCount;
    uint8 public constant MAX_MSG_LEN = 64;
    uint256 public constant BASE_MSG_FEE = 0.00001 ether;
    uint256 public constant MSG_COOLDOWN_BLOCKS = 10;

    // --- Alliances ---
    struct Alliance {
        uint40[] members;
        bool exists;
        address leader;
    }
    mapping(uint40 => uint40) public allianceOf; // tokenId => allianceId
    mapping(uint40 => Alliance) public alliances; // allianceId => Alliance
    uint40 public nextAllianceId;

    // --- Challenges ---
    enum ChallengeStatus { None, Pending, Accepted, Resolved }
    struct Challenge {
        uint40 challenger;
        uint40 opponent;
        ChallengeStatus status;
        address winner;
        uint40 timestamp;
    }
    mapping(uint40 => Challenge) public challenges;
    uint40 public nextChallengeId;

    // --- Trading/Gifting ---
    mapping(uint40 => uint40) public tradeProposals; // fromToken => toToken

    // --- Territory ---
    struct Territory {
        uint40 ownerTokenId;
        uint40 allianceId;
        uint40 lastClaimed;
    }
    mapping(uint40 => Territory) public territories;
    uint40 public constant NUM_TERRITORIES = 10;

    // --- Leveling ---
    mapping(uint40 => OCSHLib.LevelInfo) public levels;

    // --- Events ---
    event Minted(address indexed to, uint40 indexed tokenId, uint40 prevTokenId, bytes32 dataHash);
    event MessageSent(uint40 indexed tokenId, address indexed from, bytes32 textHash, uint256 fee);
    event AllianceCreated(uint40 indexed allianceId, uint40[] members, address leader);
    event AllianceJoined(uint40 indexed allianceId, uint40 indexed tokenId);
    event ChallengeIssued(uint40 indexed challengeId, uint40 challenger, uint40 opponent);
    event ChallengeResolved(uint40 indexed challengeId, address winner);
    event TradeProposed(uint40 indexed fromToken, uint40 indexed toToken);
    event TradeAccepted(uint40 indexed fromToken, uint40 indexed toToken);
    event TerritoryClaimed(uint40 indexed territoryId, uint40 indexed tokenId, uint40 indexed allianceId);
    event LeveledUp(uint40 indexed tokenId, uint8 newLevel);

    constructor() ERC721("Onchain Survival Chain", "OCSH") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(GAME_ADMIN_ROLE, msg.sender);
    }

    // --- Minting ---
    function mint(address to, bytes32 customData) external onlyOwner {
        uint40 tokenId = nextTokenId;
        uint40 prevTokenId = tokenId == 0 ? 0 : tokenId - 1;
        bytes32 dataHash = keccak256(abi.encodePacked(blockhash(block.number - 1), to, customData, prevTokenId));
        chain[tokenId] = ChainLink({
            prevTokenId: prevTokenId,
            dataHash: dataHash,
            timestamp: uint40(block.timestamp)
        });
        _safeMint(to, tokenId);
        nextTokenId++;
        emit Minted(to, tokenId, prevTokenId, dataHash);
    }

    // --- Messaging (Anti-Spam, Fee) ---
    function sendMessage(uint40 tokenId, string calldata text) external payable {
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(bytes(text).length > 0 && bytes(text).length <= MAX_MSG_LEN, "Message length");
        require(OCSHLib.messageCooldown(lastMsgBlock[tokenId], MSG_COOLDOWN_BLOCKS), "Cooldown");
        uint256 fee = OCSHLib.calcMessageFee(BASE_MSG_FEE, msgCount[tokenId]);
        require(msg.value >= fee, "Insufficient fee");
        bytes32 textHash = keccak256(bytes(text));
        messages[tokenId].push(Message({from: msg.sender, textHash: textHash, timestamp: uint40(block.timestamp)}));
        lastMsgBlock[tokenId] = block.number;
        msgCount[tokenId]++;
        emit MessageSent(tokenId, msg.sender, textHash, fee);
    }

    // --- Alliances (RBAC) ---
    function createAlliance(uint40[] calldata memberTokenIds) external returns (uint40) {
        for (uint i = 0; i < memberTokenIds.length; i++) {
            require(ownerOf(memberTokenIds[i]) == msg.sender, "Not owner of all NFTs");
        }
        uint40 id = nextAllianceId++;
        alliances[id] = Alliance({members: memberTokenIds, exists: true, leader: msg.sender});
        for (uint i = 0; i < memberTokenIds.length; i++) {
            allianceOf[memberTokenIds[i]] = id;
        }
        _setupRole(ALLIANCE_LEADER_ROLE, msg.sender);
        emit AllianceCreated(id, memberTokenIds, msg.sender);
        return id;
    }

    function joinAlliance(uint40 allianceId, uint40 tokenId) external {
        require(alliances[allianceId].exists, "Alliance does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        alliances[allianceId].members.push(tokenId);
        allianceOf[tokenId] = allianceId;
        emit AllianceJoined(allianceId, tokenId);
    }

    // --- Challenges ---
    function issueChallenge(uint40 challenger, uint40 opponent) external returns (uint40) {
        require(ownerOf(challenger) == msg.sender, "Not challenger owner");
        require(challenger != opponent, "Cannot challenge self");
        uint40 id = nextChallengeId++;
        challenges[id] = Challenge({
            challenger: challenger,
            opponent: opponent,
            status: ChallengeStatus.Pending,
            winner: address(0),
            timestamp: uint40(block.timestamp)
        });
        emit ChallengeIssued(id, challenger, opponent);
        return id;
    }

    function acceptChallenge(uint40 challengeId) external {
        Challenge storage c = challenges[challengeId];
        require(c.status == ChallengeStatus.Pending, "Not pending");
        require(ownerOf(c.opponent) == msg.sender, "Not opponent owner");
        c.status = ChallengeStatus.Accepted;
        // Sub-cent dice roll: blockhash + ids
        uint256 roll = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), c.challenger, c.opponent, block.timestamp)));
        address winner = roll % 2 == 0 ? ownerOf(c.challenger) : ownerOf(c.opponent);
        c.winner = winner;
        c.status = ChallengeStatus.Resolved;
        // Level up winner
        uint40 winnerToken = roll % 2 == 0 ? c.challenger : c.opponent;
        levels[winnerToken].xp += 100;
        uint8 newLevel = OCSHLib.xpToLevel(levels[winnerToken].xp);
        levels[winnerToken].level = newLevel;
        emit ChallengeResolved(challengeId, winner);
        emit LeveledUp(winnerToken, newLevel);
    }

    // --- Trading/Gifting ---
    function proposeTrade(uint40 fromToken, uint40 toToken) external {
        require(ownerOf(fromToken) == msg.sender, "Not owner");
        tradeProposals[fromToken] = toToken;
        emit TradeProposed(fromToken, toToken);
    }

    function acceptTrade(uint40 fromToken, uint40 toToken) external {
        require(ownerOf(toToken) == msg.sender, "Not owner");
        require(tradeProposals[fromToken] == toToken, "No proposal");
        address ownerFrom = ownerOf(fromToken);
        address ownerTo = ownerOf(toToken);
        _safeTransfer(ownerFrom, ownerTo, fromToken, "");
        _safeTransfer(ownerTo, ownerFrom, toToken, "");
        delete tradeProposals[fromToken];
        emit TradeAccepted(fromToken, toToken);
    }

    // --- Territory Control ---
    function claimTerritory(uint40 territoryId, uint40 tokenId) external {
        require(territoryId < NUM_TERRITORIES, "Invalid territory");
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        territories[territoryId] = Territory({ownerTokenId: tokenId, allianceId: allianceOf[tokenId], lastClaimed: uint40(block.timestamp)});
        // Level up for territory claim
        levels[tokenId].xp += 50;
        uint8 newLevel = OCSHLib.xpToLevel(levels[tokenId].xp);
        levels[tokenId].level = newLevel;
        emit TerritoryClaimed(territoryId, tokenId, allianceOf[tokenId]);
        emit LeveledUp(tokenId, newLevel);
    }

    // --- Chain Traversal ---
    function getChain(uint40 tokenId, uint40 depth) external view returns (ChainLink[] memory) {
        ChainLink[] memory links = new ChainLink[](depth);
        uint40 current = tokenId;
        for (uint40 i = 0; i < depth && current < nextTokenId; i++) {
            links[i] = chain[current];
            if (current == 0) break;
            current = chain[current].prevTokenId;
        }
        return links;
    }

    // --- Onchain Guide: Darknet Continuum ---
    string private constant DARKNET_GUIDE_1 = "Darknet Continuum\nMOVING VALUE WITHOUT THE INTERNET\nOn-Chain Resilience Field Manual\nIn the evolving digital economy, reliance on the traditional internet infrastructure poses risks. In cases of power outages, cable damage, or grid failures, blockchain networks can endure by finding alternative data transmission routes. This guide provides protocols to maintain transaction flow, even when conventional networks fail.\nPRTCL1\n BONE NET (BONET)\nMesh Networking \nCreate a decentralized, peer-to-peer network where devices connect directly to each other. Transactions are passed from device to device like whispers through a crowd. This method is slower but highly effective for moving signed transactions without a central internet connection.\nPRTCL2\n SIGNAL SCRIPT\nSMS Transactions\nUtilize existing cellular towers for basic communication. Transactions can be sent via plain-text SMS, containing a simple command, wallet address, and signature. This method requires no apps or browsers, relying only on a cell signal and a keypad.\nPRTCL3\nPHYSICAL HANDSHAKE (LEDGER)\nOffline Hardware Transfer ";
    string private constant DARKNET_GUIDE_2 = "Employ a physical-delivery method for transactions. One person signs a transaction, and another person physically carries the data to a location with an internet connection to broadcast it. This method turns transaction delivery into a form of spycraft.\nPRTCL4\nDATA RELIC\nUSB Sneakernet\nUse a portable storage device as the data carrier. A signed transaction file is saved to a USB stick, physically moved to a device that has network access, and then broadcast to the blockchain.\nPRTCL5\n STATIC HAUL (LONG & SHORT)\nHam Radio Blockchain \nHarness the power of amateur radio. If ham radio can transmit emails over long distances, it can transmit blockchain data, offering a resilient, cross-border method of communication that is immune to physical infrastructure cuts.\nPRTCL6\nGHOST MODE\nRadio Broadcast\nLeverage radio broadcasts to transmit transactions. A signed, compressed data packet is converted into radio waves and broadcast over the air. Anyone with the right receiver can capture, decode, and\nPRTCL7\nSKYCHAIN RELAY\nSatellite Link ";
    string private constant DARKNET_GUIDE_3 = "Broadcast transactions directly into space using a satellite dish. The satellite then relays the data back down to a receiving station connected to the blockchain network, completely bypassing all terrestrial infrastructure.\nCore Doctrine\nThe blockchain's true home is not the internet; the internet is merely a convenient transport layer. When one pathway fails, a resilient network finds another. As long as you can move data, you can move value.";

    function getDarknetGuide() external pure returns (string memory, string memory, string memory) {
        return (DARKNET_GUIDE_1, DARKNET_GUIDE_2, DARKNET_GUIDE_3);
    }

    // --- Embedded NFT Image ---
    string private constant IMAGE_DATA = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4SU...";

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) public pure override returns (string memory) {
        // Return embedded image data for all tokens
        return IMAGE_DATA;
    }
}
