// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title ARCxToken - Foundational Funding Instrument for The Arc Protocol
/// @notice Immutable, ciphered ERC20 token with governance protections and future FUEL/ADAM Protocol compatibility.
contract ARCxToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public immutable MAX_SUPPLY;
    bool public mintingFinalized = false;

    // Snapshot of deployed timestamp for future fuel migration anchoring
    uint256 public immutable deployedAt;

    // Address of future Fuel Protocol bridge (can be set only once)
    address public fuelBridge;
    bool public bridgeLocked = false;

    event MintFinalized();
    event BridgeAddressSet(address bridge);
    event BridgeLocked();

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Restricted to admins");
        _;
    }

    modifier onlyOnce(bool condition) {
        require(!condition, "Operation already finalized");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 cap,
        address deployer
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, deployer);
        _grantRole(ADMIN_ROLE, deployer);
        _grantRole(PAUSER_ROLE, deployer);
        _grantRole(MINTER_ROLE, deployer);

        MAX_SUPPLY = cap;
        deployedAt = block.timestamp;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(!mintingFinalized, "Minting has been finalized");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function finalizeMinting() public onlyAdmin onlyOnce(mintingFinalized) {
        mintingFinalized = true;
        emit MintFinalized();
    }

    function setFuelBridge(address bridge) external onlyAdmin onlyOnce(bridgeLocked) {
        require(bridge != address(0), "Invalid address");
        fuelBridge = bridge;
        emit BridgeAddressSet(bridge);
    }

    function lockBridgeAddress() external onlyAdmin onlyOnce(bridgeLocked) {
        bridgeLocked = true;
        emit BridgeLocked();
    }

    function burnToFuel(uint256 amount) external whenNotPaused {
        require(fuelBridge != address(0), "Bridge not set");
        _burn(msg.sender, amount);
        // future: notify fuel bridge
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
