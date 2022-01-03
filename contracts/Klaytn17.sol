// File: contracts/Klaytn17.sol

pragma solidity 0.5.0;

import "./KIP17Full.sol";
import "./KIP17Mintable.sol";
import "./KIP17MetadataMintable.sol";
import "./KIP17Burnable.sol";
import "./KIP17Pausable.sol";
import "./utils/Ownable.sol";

contract Klaytn17 is
    KIP17Full,
    KIP17Mintable,
    KIP17MetadataMintable,
    KIP17Burnable,
    KIP17Pausable,
    Ownable
{
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event Klaytn17Burn(address _to, uint256 tokenId);

    constructor(string memory name, string memory symbol)
        public
        KIP17Mintable()
        KIP17MetadataMintable()
        KIP17Burnable()
        KIP17Pausable()
        KIP17Full(name, symbol)
    {}

    function mintSingle(address _to, string memory _tokenURI) public onlyOwner {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(_to, newItemId);
        _setTokenURI(newItemId, _tokenURI);
    }

    function burnSingle(uint256 _tokenId) public {
        burn(_tokenId);
        emit Klaytn17Burn(msg.sender, _tokenId);
    }

    function transferSingle(address _to, uint256 _tokenId) public {
        safeTransferFrom(msg.sender, _to, _tokenId);
    }

    function changeUri(uint256 tokenId, string memory _newUri)
        public
        onlyOwner
    {
        _setTokenURI(tokenId, _newUri);
    }
}
