// File: caver-js/packages/caver-kct/src/contract/token/KIP17/KIP17Full.sol

pragma solidity ^0.5.0;

/**
 * @title Full KIP-17 Token
 * This implementation includes all the required and some optional functionality of the KIP-17 standard
 * Moreover, it includes approve all functionality using operator terminology
 * @dev see http://kips.klaytn.com/KIPs/kip-17-non_fungible_token
 */

import "./KIP17.sol";
import "./KIP17Enumerable.sol";
import "./KIP17Metadata.sol";

contract KIP17Full is KIP17, KIP17Enumerable, KIP17Metadata {
    constructor(string memory name, string memory symbol)
        public
        KIP17Metadata(name, symbol)
    {
        // solhint-disable-previous-line no-empty-blocks
    }
}
