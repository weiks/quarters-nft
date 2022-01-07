pragma solidity ^0.5.0;
import "./utils/Ownable.sol";
import "./Klaytn17.sol";

contract GameTokenFactory is Ownable {
    using SafeMath for uint256;

    mapping(address => bool) public developerAddresses;

    uint256 public totalCollection;

    mapping(uint256 => CollectionDetails) public collectionDetails;

    mapping(address => uint256[]) private collectionlistByDeveloper;

    event StatusChanged(address developerAddress, bool status);
    event CollectionCreated(Klaytn17 collection, uint256 collectionIndex);

    struct CollectionDetails {
        address collectionOwner;
        Klaytn17 collectionAddress;
    }

    modifier onlyDeveloper() {
        require(
            developerAddresses[_msgSender()],
            "caller is not the developer"
        );
        _;
    }

    /**
     * @dev Change Developer Status
     * @param developer address of developer
     * @param status new status of developer
     */
    function changeDeveloperStatus(address developer, bool status)
        public
        onlyOwner
    {
        developerAddresses[developer] = status;
        emit StatusChanged(developer, status);
    }

    /**
     * @dev Creates a new ERC721 collection
     * @param collectionName Name of Collection
     * @param collectionSymbol Symbol of Collection
     */
    function createCollection(
        string memory collectionName,
        string memory collectionSymbol
    ) public onlyDeveloper {
        Klaytn17 collection = new Klaytn17(collectionName, collectionSymbol);
        totalCollection = totalCollection.add(1);
        collectionlistByDeveloper[msg.sender].push(totalCollection);
        collectionDetails[totalCollection] = CollectionDetails(
            msg.sender,
            collection
        );
        emit CollectionCreated(collection, totalCollection);
    }

    /**
     * @dev Mint a specific collection
     * Reverts if non-owner tries to mint
     * @param collectionId id of collection
     * @param user address to get minted token
     * @param tokenURI URI of Art
     */
    function mintCollection(
        uint256 collectionId,
        address user,
        string memory tokenURI
    ) public payable onlyDeveloper {
        CollectionDetails memory collection = collectionDetails[collectionId];
        require(
            msg.sender == collection.collectionOwner,
            "Only Owner Can Mint Token"
        );
        collection.collectionAddress.mintSingle(user, tokenURI);
    }

    /**
     * @dev Change URI for Token
     * Reverts if non-owner tries to change URI
     * @param collectionId id of collection
     * @param tokenId number of token
     * @param tokenURI URI of Art
     */
    function changeTokenURI(
        uint256 collectionId,
        uint256 tokenId,
        string memory tokenURI
    ) public onlyDeveloper {
        CollectionDetails memory collection = collectionDetails[collectionId];
        require(msg.sender == collection.collectionOwner);
        collection.collectionAddress.changeUri(tokenId, tokenURI);
    }

    function getCollectionListByDeveloper(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return collectionlistByDeveloper[owner];
    }
}
