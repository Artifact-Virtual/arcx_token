library OCSHLib {
    // --- RBAC ---
    bytes32 public constant ALLIANCE_LEADER_ROLE = keccak256("ALLIANCE_LEADER_ROLE");
    bytes32 public constant GAME_ADMIN_ROLE = keccak256("GAME_ADMIN_ROLE");

    // --- Territory ---
    struct Territory {
        uint40 ownerTokenId;
        uint40 allianceId;
        uint40 lastClaimed;
    }

    // --- Leveling ---
    struct LevelInfo {
        uint32 xp;
        uint8 level;
    }

    // --- Messaging Anti-Spam ---
    function messageCooldown(uint256 lastMsgBlock, uint256 cooldownBlocks) internal view returns (bool) {
        return block.number >= lastMsgBlock + cooldownBlocks;
    }

    function calcMessageFee(uint256 baseFee, uint256 msgCount) internal pure returns (uint256) {
        // Exponential fee: baseFee * 2^msgCount
        return baseFee << msgCount;
    }

    // --- Leveling ---
    function xpToLevel(uint32 xp) internal pure returns (uint8) {
        if (xp < 100) return 1;
        if (xp < 300) return 2;
        if (xp < 600) return 3;
        if (xp < 1000) return 4;
        return 5;
    }
}
