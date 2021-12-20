    pragma solidity ^0.5.0;
    import "./utils/Ownable.sol";
    import "./Klaytn17.sol";
    import "./interface/ERC20.sol";

    contract GameTokenFactory is Ownable {
        using SafeMath for uint256;

        mapping(address => bool) public developerAddresses;

        uint256 public totalCollection;

        mapping(uint256 => CollectionDetails) public collectionDetails;

        mapping(address => uint256[]) private collectionlistByDeveloper;

        ERC20 public quarter = ERC20(0x502556cD5285a807bA262aaC6fd4D1fF5241f8E1);

        event StatusChanged(address developerAddress, bool status);
        event CollectionCreated(Klaytn17 collection, uint256 collectionIndex);

        uint256 quarterAmount = 10**18;

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
        * Change Quarters Address if required so that we dont have to redeploy contract
        */
        function changeQuarters(address _quarterAddress) public onlyOwner {
            require(address(0) != _quarterAddress);
            quarter = ERC20(_quarterAddress);
        }

        function changeDeveloperStatus(address developer, bool status)
            public
            onlyOwner
        {
            developerAddresses[developer] = status;
            emit StatusChanged(developer, status);
        }

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

        function mintCollection(
            uint256 collectionId,
            address user,
            string memory tokenURI
        ) public payable {
            CollectionDetails memory collection = collectionDetails[collectionId];
            require(msg.sender == collection.collectionOwner);
            quarter.transferFrom(msg.sender, address(this), quarterAmount);
            collection.collectionAddress.mintSingle(user, tokenURI);
        }

        function getCollectionListByDeveloper(address owner)
            public
            view
            returns (uint256[] memory)
        {
            return collectionlistByDeveloper[owner];
        }
    }
