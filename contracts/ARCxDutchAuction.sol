// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";


/**
 * @title ARCx Dutch Auction
 * @dev Fair-distribution Dutch auction system with anti-whale protection
 * Constitutional Intelligence: Price discovery through democratic market mechanisms
 */
contract ARCxDutchAuction is AccessControl, ReentrancyGuard, Pausable {

    // Roles
    bytes32 public constant AUCTION_ADMIN = keccak256("AUCTION_ADMIN");
    bytes32 public constant EMERGENCY_PAUSE = keccak256("EMERGENCY_PAUSE");

    // Token and auction parameters
    IERC20 public immutable arcxToken;
    uint256 public immutable totalTokens;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable startPrice;  // Starting price per token (in wei)
    uint256 public immutable reservePrice; // Minimum price per token (in wei)
    uint256 public immutable auctionDuration;

    // Anti-whale protection
    uint256 public immutable maxPurchasePerAddress;
    uint256 public immutable tierOneLimit;  // Small buyers get better pricing
    uint256 public immutable tierTwoLimit;  // Medium buyers
    mapping(address => uint256) public userPurchases;
    mapping(address => bool) public earlySupporter;

    // Auction state
    uint256 public tokensSold;
    uint256 public totalRaised;
    bool public finalized;
    address payable public treasury;

    // Fair distribution mechanics
    struct Purchase {
        uint256 amount;
        uint256 price;
        uint256 timestamp;
        uint8 tier;
    }
    mapping(address => Purchase[]) public userPurchaseHistory;
    mapping(address => uint256) public contributionScore;

    // Events
    event TokensPurchased(
        address indexed buyer,
        uint256 tokens,
        uint256 ethSpent,
        uint256 price,
        uint8 tier
    );
    event AuctionFinalized(uint256 tokensSold, uint256 totalRaised);
    event EarlySupporter(address indexed supporter, uint256 bonusPercent);
    event ContributionScored(address indexed user, uint256 score);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);

    constructor(
        address _arcxToken,
        uint256 _totalTokens,
        uint256 _startTime,
        uint256 _auctionDuration,
        uint256 _startPrice,
        uint256 _reservePrice,
        address payable _treasury,
        uint256 _maxPurchasePerAddress
    ) {
        require(_arcxToken != address(0), "Invalid token address");
        require(_totalTokens > 0, "Total tokens must be > 0");
        require(_startTime >= block.timestamp, "Start time must be future");
        require(_auctionDuration > 0, "Duration must be > 0");
        require(_startPrice > _reservePrice, "Start price must be > reserve");
        require(_treasury != address(0), "Invalid treasury address");

    arcxToken = IERC20(_arcxToken);
    totalTokens = _totalTokens;
    startTime = _startTime;
    auctionDuration = _auctionDuration;
    endTime = _startTime + _auctionDuration;
    startPrice = _startPrice;
    reservePrice = _reservePrice;
    treasury = _treasury;
    maxPurchasePerAddress = _maxPurchasePerAddress;

    // Tier limits for fair distribution
    tierOneLimit = _maxPurchasePerAddress / 10;  // 10% max for small buyers
    tierTwoLimit = _maxPurchasePerAddress / 4;   // 25% max for medium buyers

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUCTION_ADMIN, msg.sender);
        _grantRole(EMERGENCY_PAUSE, msg.sender);
    }

    /**
     * @dev Calculate current token price based on time elapsed and tokens sold
     * Enhanced with fairness bonuses
     */
    function getCurrentPrice() public view returns (uint256) {
        if (block.timestamp < startTime) {
            return startPrice;
        }
        
        if (block.timestamp >= endTime || tokensSold >= totalTokens) {
            return reservePrice;
        }

        // Time-based price decline
    uint256 timeElapsed = block.timestamp - startTime;
    uint256 priceDecline = startPrice - reservePrice;
        uint256 timeBasedPrice = startPrice - (
            (priceDecline * timeElapsed) / auctionDuration
        );

        // Demand-based adjustment
    uint256 soldPercentage = (tokensSold * 100) / totalTokens;
        if (soldPercentage > 80) {
            // High demand - slow price decline
            timeBasedPrice = timeBasedPrice + (timeBasedPrice / 10);
        } else if (soldPercentage < 20) {
            // Low demand - accelerate price decline  
            timeBasedPrice = timeBasedPrice - (timeBasedPrice / 20);
        }

        return timeBasedPrice < reservePrice ? reservePrice : timeBasedPrice;
    }

    /**
     * @dev Calculate tier-based pricing bonus
     */
    function getTierBonus(address buyer, uint256 amount) public view returns (uint8, uint256) {
        uint256 totalPurchased = userPurchases[buyer];
        uint8 tier;
        uint256 bonusPercent = 0;

    if ((totalPurchased + amount) <= tierOneLimit) {
            tier = 1;
            bonusPercent = 15; // 15% discount for small buyers
    } else if ((totalPurchased + amount) <= tierTwoLimit) {
            tier = 2;
            bonusPercent = 10; // 10% discount for medium buyers
        } else {
            tier = 3;
            bonusPercent = 0;  // No discount for large buyers
        }

        // Early supporter bonus
        if (earlySupporter[buyer]) {
            bonusPercent = bonusPercent + 5;
        }

        // Contribution score bonus (max 10%)
    uint256 contributionBonus = contributionScore[buyer] / 10;
        if (contributionBonus > 10) contributionBonus = 10;
    bonusPercent = bonusPercent + contributionBonus;

        return (tier, bonusPercent);
    }

    /**
     * @dev Purchase tokens with fairness mechanisms
     */
    function purchaseTokens() external payable nonReentrant whenNotPaused {
        require(block.timestamp >= startTime, "Auction not started");
        require(block.timestamp < endTime, "Auction ended");
        require(!finalized, "Auction finalized");
        require(msg.value > 0, "Must send ETH");

        uint256 currentPrice = getCurrentPrice();
        (uint8 tier, uint256 bonusPercent) = getTierBonus(msg.sender, 0);
        
        // Apply tier bonus to price
        uint256 effectivePrice = currentPrice;
        if (bonusPercent > 0) {
            effectivePrice = currentPrice - ((currentPrice * bonusPercent) / 100);
        }

    uint256 tokensToReceive = (msg.value * 1e18) / effectivePrice;
        
    require(tokensSold + tokensToReceive <= totalTokens, "Not enough tokens available");
        require(
            userPurchases[msg.sender] + tokensToReceive <= maxPurchasePerAddress,
            "Exceeds max purchase limit"
        );

        // Update state
    tokensSold = tokensSold + tokensToReceive;
    totalRaised = totalRaised + msg.value;
    userPurchases[msg.sender] = userPurchases[msg.sender] + tokensToReceive;

        // Record purchase history
        userPurchaseHistory[msg.sender].push(Purchase({
            amount: tokensToReceive,
            price: effectivePrice,
            timestamp: block.timestamp,
            tier: tier
        }));

        // Transfer tokens
        require(
            arcxToken.transfer(msg.sender, tokensToReceive),
            "Token transfer failed"
        );

        emit TokensPurchased(
            msg.sender,
            tokensToReceive,
            msg.value,
            effectivePrice,
            tier
        );
    }

    /**
     * @dev Mark address as early supporter (admin function)
     */
    function setEarlySupporter(address supporter, bool status) 
        external 
        onlyRole(AUCTION_ADMIN) 
    {
        earlySupporter[supporter] = status;
        if (status) {
            emit EarlySupporter(supporter, 5);
        }
    }

    /**
     * @dev Set contribution score for fair distribution (admin function)
     */
    function setContributionScore(address user, uint256 score) 
        external 
        onlyRole(AUCTION_ADMIN) 
    {
        contributionScore[user] = score;
        emit ContributionScored(user, score);
    }

    /**
     * @dev Finalize auction and withdraw funds
     */
    function finalize() external onlyRole(AUCTION_ADMIN) {
        require(
            block.timestamp >= endTime || tokensSold >= totalTokens,
            "Auction still active"
        );
        require(!finalized, "Already finalized");

        finalized = true;

        // Transfer remaining tokens back to treasury
    uint256 remainingTokens = totalTokens - tokensSold;
        if (remainingTokens > 0) {
            require(
                arcxToken.transfer(treasury, remainingTokens),
                "Failed to return remaining tokens"
            );
        }

        // Transfer ETH to treasury
        treasury.transfer(address(this).balance);

        emit AuctionFinalized(tokensSold, totalRaised);
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyRole(EMERGENCY_PAUSE) {
        _pause();
    }

    /**
     * @dev Emergency unpause function
     */
    function unpause() external onlyRole(EMERGENCY_PAUSE) {
        _unpause();
    }

    /**
     * @dev Emergency admin withdrawal of tokens
     * @param token Address of the token to withdraw (use arcxToken for ARCx)
     * @param to Address to send tokens to (deployer or treasury)
     * @param amount Amount of tokens to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).transfer(to, amount);
        
        emit EmergencyWithdrawal(token, to, amount);
    }

    /**
     * @dev Emergency admin withdrawal of all tokens of a specific type
     * @param token Address of the token to withdraw
     * @param to Address to send tokens to
     */
    function emergencyWithdrawAll(
        address token,
        address to
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        IERC20(token).transfer(to, balance);
        
        emit EmergencyWithdrawal(token, to, balance);
    }

    /**
     * @dev Get user purchase history
     */
    function getUserPurchases(address user) external view returns (Purchase[] memory) {
        return userPurchaseHistory[user];
    }

    /**
     * @dev Get auction status
     */
    function getAuctionStatus() external view returns (
        uint256 _currentPrice,
        uint256 _tokensSold,
        uint256 _tokensRemaining,
        uint256 _totalRaised,
        uint256 _timeRemaining,
        bool _isActive
    ) {
        _currentPrice = getCurrentPrice();
        _tokensSold = tokensSold;
    _tokensRemaining = totalTokens - tokensSold;
        _totalRaised = totalRaised;
    _timeRemaining = block.timestamp >= endTime ? 0 : endTime - block.timestamp;
        _isActive = block.timestamp >= startTime && block.timestamp < endTime && !finalized;
    }

    /**
     * @dev Constitutional Intelligence: Calculate fairness score
     */
    function calculateFairnessScore() external view returns (uint256) {
        if (tokensSold == 0) return 100;
        
        // Base fairness: How distributed the sales are
    uint256 averagePurchase = tokensSold / (totalTokens / maxPurchasePerAddress);
        
        // Tier distribution fairness
        uint256 tierOneSales = 0;
        // This would require tracking tier sales in practice
        
        // Time distribution fairness  
    uint256 timeFairness = (endTime - startTime) / 3600; // Hours of equal access
        
    return ((averagePurchase + timeFairness) * 100) / 200;
    }
}
