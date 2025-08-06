// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./IPoolManager.sol";

struct MintParams {
    PoolKey poolKey;
    int24 tickLower;
    int24 tickUpper;
    uint256 liquidity;
    uint256 amount0Max;
    uint256 amount1Max;
    address recipient;
    uint256 deadline;
}

interface IPositionManager {
    function mint(MintParams calldata params)
        external
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );
        
    function burn(uint256 tokenId) external;
    
    function collect(uint256 tokenId, address recipient)
        external
        returns (uint256 amount0, uint256 amount1);
}
