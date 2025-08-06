// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

struct PoolKey {
    address currency0;
    address currency1;
    uint24 fee;
    int24 tickSpacing;
    address hooks;
}

interface IPoolManager {
    function initialize(
        PoolKey memory key,
        uint160 sqrtPriceX96
    ) external returns (int24 tick);
    
    function getSlot0(bytes32 id)
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint8 protocolFee,
            uint24 lpFee
        );
}
