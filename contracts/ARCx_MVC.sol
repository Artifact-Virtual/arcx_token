// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title ARCxMasterVesting - Master Vesting Contract for ARCx Token Distribution
/// @notice Handles token vesting for all ARCx allocation categories with enhanced security and governance
/// @dev Built with enterprise-grade security patterns matching ARCxToken standards
contract ARCxMasterVesting is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    // Role definitions - matching ARCxToken pattern
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VESTING_MANAGER_ROLE = keccak256("VESTING_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Vesting categories for allocation tracking
    enum VestingCategory {
        CORE_TEAM,           // 20% - Core Team & Developers
        ECOSYSTEM_FUND,      // 25% - Ecosystem Fund  
        COMMUNITY_AIRDROP,   // 15% - Community & Airdrop
        STRATEGIC_PARTNERS,  // 10% - Strategic Partners
        PUBLIC_SALE,         // 20% - Public Sale
        TREASURY_RESERVE     // 10% - Treasury Reserve
    }

    struct VestingInfo {
        uint256 totalAmount;        // Total tokens allocated
        uint256 released;           // Tokens already released
        uint64 start;              // Vesting start timestamp
        uint64 cliff;              // Cliff duration in seconds
        uint64 duration;           // Total vesting duration in seconds
        VestingCategory category;   // Allocation category
        bool revoked;              // Emergency revocation flag
        bool initialized;          // Initialization flag
    }

    IERC20 public immutable token;
    
    // Beneficiary address => vesting information
    mapping(address => VestingInfo) public vestings;
    
    // Category => total allocated amount tracking
    mapping(VestingCategory => uint256) public categoryAllocations;
    
    // Maximum allocations per category (in wei, 18 decimals)
    mapping(VestingCategory => uint256) public maxCategoryAllocations;

    // Total tokens under vesting management
    uint256 public totalAllocated;
    uint256 public totalReleased;
    uint256 public totalRevoked;

    // Vesting start time for synchronized launches
    uint256 public globalVestingStart;

    // Events - comprehensive for auditability and transparency
    event VestingAdded(
        address indexed beneficiary, 
        uint256 totalAmount, 
        uint64 start, 
        uint64 cliff, 
        uint64 duration,
        VestingCategory indexed category
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unvestedAmount);
    event VestingRestored(address indexed beneficiary);
    event GlobalVestingStartSet(uint256 startTime);
    event CategoryAllocationUpdated(VestingCategory indexed category, uint256 maxAllocation);
    event EmergencyWithdrawal(address indexed to, uint256 amount, string reason);

    // Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Restricted to admins");
        _;
    }

    modifier onlyVestingManager() {
        require(hasRole(VESTING_MANAGER_ROLE, msg.sender), "Restricted to vesting managers");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    modifier vestingExists(address beneficiary) {
        require(vestings[beneficiary].initialized, "Vesting not found");
        _;
    }

    constructor(
        IERC20 _token,
        address _admin,
        uint256 _globalVestingStart
    ) validAddress(_admin) {
        require(address(_token) != address(0), "Invalid token address");
        require(_globalVestingStart > block.timestamp, "Start time must be in future");
        
        token = _token;
        globalVestingStart = _globalVestingStart;
        
        // Setup roles - matching ARCxToken pattern
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(VESTING_MANAGER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        
        // Initialize category allocations based on tokenomics (1M ARCx total)
        // These are maximums to prevent over-allocation
        maxCategoryAllocations[VestingCategory.CORE_TEAM] = 200_000 * 10**18;        // 20%
        maxCategoryAllocations[VestingCategory.ECOSYSTEM_FUND] = 250_000 * 10**18;   // 25%
        maxCategoryAllocations[VestingCategory.COMMUNITY_AIRDROP] = 150_000 * 10**18; // 15%
        maxCategoryAllocations[VestingCategory.STRATEGIC_PARTNERS] = 100_000 * 10**18; // 10%
        maxCategoryAllocations[VestingCategory.PUBLIC_SALE] = 200_000 * 10**18;      // 20%
        maxCategoryAllocations[VestingCategory.TREASURY_RESERVE] = 100_000 * 10**18; // 10%
    }

    /// @notice Add a new vesting schedule for a beneficiary
    /// @param beneficiary Address to receive vested tokens
    /// @param totalAmount Total tokens to vest (in wei)
    /// @param start Vesting start timestamp (0 = use global start)
    /// @param cliff Cliff duration in seconds
    /// @param duration Total vesting duration in seconds
    /// @param category Allocation category for tracking
    function addVesting(
        address beneficiary,
        uint256 totalAmount,
        uint64 start,
        uint64 cliff,
        uint64 duration,
        VestingCategory category
    ) external onlyVestingManager validAddress(beneficiary) whenNotPaused {
        require(!vestings[beneficiary].initialized, "Vesting already exists");
        require(totalAmount > 0, "Amount must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");
        require(cliff <= duration, "Cliff cannot exceed duration");
        
        // Use global start if not specified
        uint64 vestingStart = start == 0 ? uint64(globalVestingStart) : start;
        require(vestingStart >= block.timestamp, "Start time cannot be in the past");
        
        // Check category allocation limits
        uint256 newCategoryTotal = categoryAllocations[category] + totalAmount;
        require(newCategoryTotal <= maxCategoryAllocations[category], "Exceeds category allocation limit");
        
        // Ensure contract has sufficient balance
        require(token.balanceOf(address(this)) >= totalAllocated + totalAmount, "Insufficient contract balance");
        
        // Update allocations
        vestings[beneficiary] = VestingInfo({
            totalAmount: totalAmount,
            released: 0,
            start: vestingStart,
            cliff: cliff,
            duration: duration,
            category: category,
            revoked: false,
            initialized: true
        });
        
        categoryAllocations[category] = newCategoryTotal;
        totalAllocated += totalAmount;
        
        emit VestingAdded(beneficiary, totalAmount, vestingStart, cliff, duration, category);
    }

    /// @notice Calculate releasable tokens for a beneficiary
    /// @param beneficiary Address to check
    /// @return amount of tokens that can be released
    function releasable(address beneficiary) public view vestingExists(beneficiary) returns (uint256) {
        VestingInfo memory v = vestings[beneficiary];
        
        if (v.revoked) return 0;
        if (block.timestamp < v.start + v.cliff) return 0;
        
        uint256 elapsed = block.timestamp - v.start;
        uint256 vested;
        
        if (elapsed >= v.duration) {
            vested = v.totalAmount;
        } else {
            vested = (v.totalAmount * elapsed) / v.duration;
        }
        
        return vested - v.released;
    }

    /// @notice Release vested tokens to the caller
    function release() external nonReentrant whenNotPaused vestingExists(msg.sender) {
        uint256 amount = releasable(msg.sender);
        require(amount > 0, "No tokens to release");
        
        vestings[msg.sender].released += amount;
        totalReleased += amount;
        
        token.safeTransfer(msg.sender, amount);
        emit TokensReleased(msg.sender, amount);
    }

    /// @notice Release vested tokens for a specific beneficiary (admin function)
    /// @param beneficiary Address to release tokens for
    function releaseFor(address beneficiary) external onlyVestingManager nonReentrant whenNotPaused vestingExists(beneficiary) {
        uint256 amount = releasable(beneficiary);
        require(amount > 0, "No tokens to release");
        
        vestings[beneficiary].released += amount;
        totalReleased += amount;
        
        token.safeTransfer(beneficiary, amount);
        emit TokensReleased(beneficiary, amount);
    }

    /// @notice Revoke vesting for a beneficiary (emergency use only)
    /// @param beneficiary Address to revoke vesting for
    function revokeVesting(address beneficiary) external onlyAdmin vestingExists(beneficiary) {
        require(!vestings[beneficiary].revoked, "Already revoked");
        
        uint256 unvested = vestings[beneficiary].totalAmount - vestings[beneficiary].released;
        vestings[beneficiary].revoked = true;
        totalRevoked += unvested;
        
        emit VestingRevoked(beneficiary, unvested);
    }

    /// @notice Restore revoked vesting (admin function)
    /// @param beneficiary Address to restore vesting for
    function restoreVesting(address beneficiary) external onlyAdmin vestingExists(beneficiary) {
        require(vestings[beneficiary].revoked, "Not revoked");
        
        uint256 unvested = vestings[beneficiary].totalAmount - vestings[beneficiary].released;
        vestings[beneficiary].revoked = false;
        totalRevoked -= unvested;
        
        emit VestingRestored(beneficiary);
    }

    /// @notice Update global vesting start time (before vesting begins)
    /// @param newStart New global start timestamp
    function updateGlobalVestingStart(uint256 newStart) external onlyAdmin {
        require(block.timestamp < globalVestingStart, "Vesting already started");
        require(newStart > block.timestamp, "Start time must be in future");
        
        globalVestingStart = newStart;
        emit GlobalVestingStartSet(newStart);
    }

    /// @notice Update maximum allocation for a category
    /// @param category Category to update
    /// @param maxAllocation New maximum allocation
    function updateCategoryAllocation(VestingCategory category, uint256 maxAllocation) external onlyAdmin {
        require(maxAllocation >= categoryAllocations[category], "Cannot reduce below current allocation");
        
        maxCategoryAllocations[category] = maxAllocation;
        emit CategoryAllocationUpdated(category, maxAllocation);
    }

    /// @notice Pause contract (emergency)
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Emergency withdrawal of tokens (admin only)
    /// @param to Address to send tokens to
    /// @param amount Amount to withdraw
    /// @param reason Reason for withdrawal
    function emergencyWithdraw(
        address to, 
        uint256 amount, 
        string calldata reason
    ) external onlyAdmin validAddress(to) {
        require(bytes(reason).length > 0, "Reason required");
        require(amount <= token.balanceOf(address(this)), "Insufficient balance");
        
        token.safeTransfer(to, amount);
        emit EmergencyWithdrawal(to, amount, reason);
    }

    /// @notice Get vesting information for multiple beneficiaries
    /// @param beneficiaries Array of addresses to query
    /// @return vestingInfos Array of vesting information
    function getVestings(address[] calldata beneficiaries) 
        external 
        view 
        returns (VestingInfo[] memory vestingInfos) 
    {
        vestingInfos = new VestingInfo[](beneficiaries.length);
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            vestingInfos[i] = vestings[beneficiaries[i]];
        }
    }

    /// @notice Get category statistics
    /// @param category Category to query
    /// @return allocated Current allocation
    /// @return maxAllocation Maximum allowed allocation
    /// @return remaining Remaining allocation capacity
    function getCategoryStats(VestingCategory category) 
        external 
        view 
        returns (uint256 allocated, uint256 maxAllocation, uint256 remaining) 
    {
        allocated = categoryAllocations[category];
        maxAllocation = maxCategoryAllocations[category];
        remaining = maxAllocation - allocated;
    }

    /// @notice Get contract statistics
    /// @return totalAllocated_ Total tokens allocated
    /// @return totalReleased_ Total tokens released
    /// @return totalRevoked_ Total tokens revoked
    /// @return contractBalance Current contract token balance
    function getContractStats() 
        external 
        view 
        returns (uint256 totalAllocated_, uint256 totalReleased_, uint256 totalRevoked_, uint256 contractBalance) 
    {
        totalAllocated_ = totalAllocated;
        totalReleased_ = totalReleased;
        totalRevoked_ = totalRevoked;
        contractBalance = token.balanceOf(address(this));
    }
}
