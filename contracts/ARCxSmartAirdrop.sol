// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title ARCx Smart Airdrop
 * @dev Merit-based airdrop system with sybil resistance and contribution scoring
 * Constitutional Intelligence: Democratic distribution based on verified contributions
 */
contract ARCxSmartAirdrop is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant AIRDROP_ADMIN = keccak256("AIRDROP_ADMIN");
    bytes32 public constant CONTRIBUTION_SCORER = keccak256("CONTRIBUTION_SCORER");

    // Token and airdrop parameters
    IERC20 public immutable arcxToken;
    uint256 public immutable totalTokens;
    uint256 public immutable claimDeadline;
    bytes32 public merkleRoot;

    // Contribution categories and weights
    enum ContributionType {
        DEVELOPER,       // Code contributions
        COMMUNITY,       // Community building
        CONTENT_CREATOR, // Educational content
        EARLY_ADOPTER,   // Early ecosystem participation
        GOVERNANCE,      // Governance participation
        BUG_REPORTER,    // Security contributions
        ECOSYSTEM_BUILDER // Partnership/integration work
    }

    struct ContributionProof {
        ContributionType contributionType;
        uint256 baseAllocation;
        uint256 multiplier; // 100 = 1x, 200 = 2x, etc.
        uint256 timestamp;
        bytes32[] merkleProof;
    }

    struct ClaimData {
        address recipient;
        uint256 amount;
        ContributionType[] contributions;
        uint256 totalScore;
        bool claimed;
    }

    // State tracking
    mapping(address => ClaimData) public claims;
    mapping(address => bool) public hasClaimed;
    mapping(ContributionType => uint256) public contributionWeights;
    mapping(address => uint256) public userContributionScores;
    
    uint256 public totalClaimed;
    uint256 public totalEligibleUsers;
    
    // Anti-sybil mechanisms
    mapping(address => bytes32) public addressFingerprints;
    mapping(bytes32 => bool) public usedFingerprints;
    uint256 public minimumAccountAge; // Minimum block number for eligibility

    // Events
    event TokensClaimed(
        address indexed recipient,
        uint256 amount,
        ContributionType[] contributions,
        uint256 totalScore
    );
    event ContributionScored(
        address indexed user,
        ContributionType contributionType,
        uint256 score
    );
    event MerkleRootUpdated(bytes32 newRoot);
    event SybilDetected(address indexed suspicious, bytes32 fingerprint);

    constructor(
        address _arcxToken,
        uint256 _totalTokens,
        uint256 _claimDuration,
        bytes32 _merkleRoot,
        uint256 _minimumAccountAge
    ) {
        require(_arcxToken != address(0), "Invalid token address");
        require(_totalTokens > 0, "Total tokens must be > 0");
        require(_claimDuration > 0, "Claim duration must be > 0");

        arcxToken = IERC20(_arcxToken);
        totalTokens = _totalTokens;
        claimDeadline = block.timestamp + _claimDuration;
        merkleRoot = _merkleRoot;
        minimumAccountAge = _minimumAccountAge;

        // Initialize contribution weights
        contributionWeights[ContributionType.DEVELOPER] = 200;        // 2x multiplier
        contributionWeights[ContributionType.COMMUNITY] = 150;        // 1.5x multiplier  
        contributionWeights[ContributionType.CONTENT_CREATOR] = 130;  // 1.3x multiplier
        contributionWeights[ContributionType.EARLY_ADOPTER] = 120;    // 1.2x multiplier
        contributionWeights[ContributionType.GOVERNANCE] = 180;       // 1.8x multiplier
        contributionWeights[ContributionType.BUG_REPORTER] = 250;     // 2.5x multiplier
        contributionWeights[ContributionType.ECOSYSTEM_BUILDER] = 170; // 1.7x multiplier

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AIRDROP_ADMIN, msg.sender);
        _grantRole(CONTRIBUTION_SCORER, msg.sender);
    }

    /**
     * @dev Calculate allocation based on contributions
     */
    function calculateAllocation(
        uint256 baseAmount,
        ContributionType[] memory contributions
    ) public view returns (uint256) {
        if (contributions.length == 0) {
            return baseAmount;
        }

        uint256 totalMultiplier = 100; // Base 1x
        
        for (uint256 i = 0; i < contributions.length; i++) {
            uint256 weight = contributionWeights[contributions[i]];
            totalMultiplier += (weight - 100); // Add bonus
        }

        // Cap maximum multiplier at 5x
        if (totalMultiplier > 500) {
            totalMultiplier = 500;
        }

        return baseAmount * totalMultiplier / 100;
    }

    /**
     * @dev Verify anti-sybil fingerprint
     */
    function verifyAntiSybil(
        address user,
        bytes32 fingerprint,
        uint256 accountCreationBlock
    ) internal returns (bool) {
        // Check minimum account age
        if (accountCreationBlock > minimumAccountAge) {
            return false;
        }

        // Check for duplicate fingerprints
        if (usedFingerprints[fingerprint]) {
            emit SybilDetected(user, fingerprint);
            return false;
        }

        addressFingerprints[user] = fingerprint;
        usedFingerprints[fingerprint] = true;
        return true;
    }

    /**
     * @dev Claim airdrop tokens with contribution verification
     */
    function claimTokens(
        uint256 baseAmount,
        ContributionType[] memory contributions,
        bytes32[] memory merkleProof,
        bytes32 antiSybilFingerprint,
        uint256 accountCreationBlock
    ) external nonReentrant whenNotPaused {
        require(block.timestamp <= claimDeadline, "Claim period ended");
        require(!hasClaimed[msg.sender], "Already claimed");
        
        // Verify anti-sybil
        require(
            verifyAntiSybil(msg.sender, antiSybilFingerprint, accountCreationBlock),
            "Anti-sybil verification failed"
        );

        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(
            msg.sender,
            baseAmount,
            contributions
        ));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid merkle proof"
        );

        // Calculate final allocation
        uint256 finalAmount = calculateAllocation(baseAmount, contributions);
        require(totalClaimed + finalAmount <= totalTokens, "Insufficient tokens");

        // Update state
        hasClaimed[msg.sender] = true;
        totalClaimed += finalAmount;
        
        // Calculate contribution score
        uint256 contributionScore = 0;
        for (uint256 i = 0; i < contributions.length; i++) {
            contributionScore += contributionWeights[contributions[i]];
        }
        userContributionScores[msg.sender] = contributionScore;

        // Record claim data
        claims[msg.sender] = ClaimData({
            recipient: msg.sender,
            amount: finalAmount,
            contributions: contributions,
            totalScore: contributionScore,
            claimed: true
        });

        // Transfer tokens
        require(
            arcxToken.transfer(msg.sender, finalAmount),
            "Token transfer failed"
        );

        emit TokensClaimed(msg.sender, finalAmount, contributions, contributionScore);
    }

    /**
     * @dev Batch set contribution scores (admin function)
     */
    function batchSetContributionScores(
        address[] memory users,
        ContributionType[] memory contributionTypes,
        uint256[] memory scores
    ) external onlyRole(CONTRIBUTION_SCORER) {
        require(
            users.length == contributionTypes.length && 
            users.length == scores.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < users.length; i++) {
            userContributionScores[users[i]] += scores[i];
            emit ContributionScored(users[i], contributionTypes[i], scores[i]);
        }
    }

    /**
     * @dev Update merkle root (admin function)
     */
    function updateMerkleRoot(bytes32 _merkleRoot) external onlyRole(AIRDROP_ADMIN) {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    /**
     * @dev Update contribution weights (admin function)
     */
    function updateContributionWeights(
        ContributionType contributionType,
        uint256 newWeight
    ) external onlyRole(AIRDROP_ADMIN) {
        contributionWeights[contributionType] = newWeight;
    }

    /**
     * @dev Withdraw unclaimed tokens after deadline
     */
    function withdrawUnclaimedTokens(address treasury) 
        external 
        onlyRole(AIRDROP_ADMIN) 
    {
        require(block.timestamp > claimDeadline, "Claim period not ended");
        
        uint256 remainingTokens = totalTokens - totalClaimed;
        if (remainingTokens > 0) {
            require(
                arcxToken.transfer(treasury, remainingTokens),
                "Token transfer failed"
            );
        }
    }

    /**
     * @dev Get claim status for user
     */
    function getClaimStatus(address user) external view returns (
        bool eligible,
        bool claimed,
        uint256 contributionScore,
        uint256 timeRemaining
    ) {
        claimed = hasClaimed[user];
        contributionScore = userContributionScores[user];
        timeRemaining = block.timestamp >= claimDeadline ? 0 : claimDeadline - block.timestamp;
        
        // Check if user has fingerprint (indicates eligibility verification)
        eligible = addressFingerprints[user] != bytes32(0) || !claimed;
    }

    /**
     * @dev Get airdrop statistics
     */
    function getAirdropStats() external view returns (
        uint256 _totalTokens,
        uint256 _totalClaimed,
        uint256 _totalEligibleUsers,
        uint256 _percentageClaimed,
        uint256 _timeRemaining
    ) {
        _totalTokens = totalTokens;
        _totalClaimed = totalClaimed;
        _totalEligibleUsers = totalEligibleUsers;
        _percentageClaimed = totalTokens > 0 ? (totalClaimed * 100) / totalTokens : 0;
        _timeRemaining = block.timestamp >= claimDeadline ? 0 : claimDeadline - block.timestamp;
    }

    /**
     * @dev Constitutional Intelligence: Calculate distribution fairness
     */
    function calculateDistributionFairness() external view returns (uint256) {
        if (totalClaimed == 0) return 100;

        // Measure how evenly distributed the airdrop is
        uint256 averageClaim = totalClaimed / totalEligibleUsers;
        
        // Contribution diversity score
        uint256 diversityScore = 0; // Would need to track contribution type distribution
        
        // Time distribution fairness
        uint256 timeWindow = claimDeadline - (claimDeadline - 7 days); // 7 day window
        uint256 timeFairness = timeWindow / 3600; // Hours of access
        
        return (averageClaim + diversityScore + timeFairness) / 3;
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Emergency unpause  
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
