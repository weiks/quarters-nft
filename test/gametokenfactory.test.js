const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("GameTokenFactory", function () {
  it("change developer status", async function () {

    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1] = await ethers.getSigners();
    expect(await deployedGameTokenFactory.developerAddresses(addr1.address)).to.equal(false);

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);
    expect(await deployedGameTokenFactory.developerAddresses(addr1.address)).to.equal(true);

  });


  it("create collection from developer account", async function () {

    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1] = await ethers.getSigners();
    expect(await deployedGameTokenFactory.developerAddresses(addr1.address)).to.equal(false);

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);
    expect(await deployedGameTokenFactory.developerAddresses(addr1.address)).to.equal(true);

    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");

    const collectionList = await deployedGameTokenFactory.getCollectionListByDeveloper(
      addr1.address
    );
    const collectionInfo = await deployedGameTokenFactory.collectionDetails(Number(collectionList[0]));

    const KIP17Full = await ethers.getContractFactory("KIP17Full");
    const deployedKIP17Full = KIP17Full.attach(collectionInfo[1]);
    expect((await deployedKIP17Full.name())).to.equal('TestCollection');
    expect((await deployedKIP17Full.symbol())).to.equal('TestCollection');
  });

  it("should not allow non developer account to create account", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1] = await ethers.getSigners();
    await expect(
      deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection")
    ).to.be.revertedWith("caller is not the developer");
  })

  it("Mint A Nft of own collection and token balance", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1] = await ethers.getSigners();
    expect(await deployedGameTokenFactory.developerAddresses(addr1.address)).to.equal(false);

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);
    expect(await deployedGameTokenFactory.developerAddresses(addr1.address)).to.equal(true);

    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");
    const collectionDetails = await deployedGameTokenFactory.getCollectionListByDeveloper(addr1.address);
    await deployedGameTokenFactory.connect(addr1).mintCollection(collectionDetails[0], addr1.address, "test");

    const collectionList = await deployedGameTokenFactory.getCollectionListByDeveloper(
      addr1.address
    );
    const collectionInfo = await deployedGameTokenFactory.collectionDetails(Number(collectionList[0]));

    const KIP17Full = await ethers.getContractFactory("KIP17Full");
    const deployedKIP17Full = KIP17Full.attach(collectionInfo[1]);
    expect((await deployedKIP17Full.balanceOf(addr1.address))).to.equal(1);
  })

  it("Cannot Mint A Nft of other collection", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1] = await ethers.getSigners();

    await deployedGameTokenFactory.changeDeveloperStatus(owner.address, true);
    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);

    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");
    const collectionDetails = await deployedGameTokenFactory.getCollectionListByDeveloper(addr1.address);

    await expect(
      deployedGameTokenFactory.mintCollection(collectionDetails[0], addr1.address, "test")
    ).to.be.revertedWith("Only Owner Can Mint Token");
  })

  it("Non Developer Cannot Mint A Nft of other collection", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1] = await ethers.getSigners();

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);

    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");
    const collectionDetails = await deployedGameTokenFactory.getCollectionListByDeveloper(addr1.address);
    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, false);

    await expect(
      deployedGameTokenFactory.mintCollection(collectionDetails[0], addr1.address, "test")
    ).to.be.revertedWith("caller is not the developer");
  })


  it("Transfer token to another wallet", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1] = await ethers.getSigners();

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);


    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");
    const collectionDetails = await deployedGameTokenFactory.getCollectionListByDeveloper(addr1.address);
    await deployedGameTokenFactory.connect(addr1).mintCollection(collectionDetails[0], addr1.address, "test");

    const collectionList = await deployedGameTokenFactory.getCollectionListByDeveloper(
      addr1.address
    );
    const collectionInfo = await deployedGameTokenFactory.collectionDetails(Number(collectionList[0]));

    const KIP17Full = await ethers.getContractFactory("KIP17Full");
    const deployedKIP17Full = KIP17Full.attach(collectionInfo[1]);
    expect((await deployedKIP17Full.balanceOf(addr1.address))).to.equal(1);
    expect((await deployedKIP17Full.balanceOf(owner.address))).to.equal(0);
    const tokenId = await deployedKIP17Full.tokenOfOwnerByIndex(addr1.address, 0);
    await deployedKIP17Full.connect(addr1).transferFrom(addr1.address, owner.address, tokenId);

    expect((await deployedKIP17Full.balanceOf(owner.address))).to.equal(1);
    expect((await deployedKIP17Full.balanceOf(addr1.address))).to.equal(0);

  })


  it("Approve another wallet to spend token", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1, addr2] = await ethers.getSigners();

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);


    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");
    const collectionDetails = await deployedGameTokenFactory.getCollectionListByDeveloper(addr1.address);
    await deployedGameTokenFactory.connect(addr1).mintCollection(collectionDetails[0], addr1.address, "test");

    const collectionList = await deployedGameTokenFactory.getCollectionListByDeveloper(
      addr1.address
    );
    const collectionInfo = await deployedGameTokenFactory.collectionDetails(Number(collectionList[0]));

    const KIP17Full = await ethers.getContractFactory("KIP17Full");
    const deployedKIP17Full = KIP17Full.attach(collectionInfo[1]);
    expect((await deployedKIP17Full.balanceOf(addr1.address))).to.equal(1);
    expect((await deployedKIP17Full.balanceOf(addr2.address))).to.equal(0);
    const tokenId = await deployedKIP17Full.tokenOfOwnerByIndex(addr1.address, 0);

    await deployedKIP17Full.connect(addr1).approve(owner.address, tokenId);
    await deployedKIP17Full.transferFrom(addr1.address, addr2.address, tokenId);

    expect((await deployedKIP17Full.balanceOf(addr2.address))).to.equal(1);
    expect((await deployedKIP17Full.balanceOf(addr1.address))).to.equal(0);

  })

  it("Retrive token uri", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1,] = await ethers.getSigners();

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);


    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");
    const collectionDetails = await deployedGameTokenFactory.getCollectionListByDeveloper(addr1.address);
    await deployedGameTokenFactory.connect(addr1).mintCollection(collectionDetails[0], addr1.address, "test");
    await deployedGameTokenFactory.connect(addr1).mintCollection(collectionDetails[0], addr1.address, "test1");

    const collectionList = await deployedGameTokenFactory.getCollectionListByDeveloper(
      addr1.address
    );
    const collectionInfo = await deployedGameTokenFactory.collectionDetails(Number(collectionList[0]));

    const KIP17Full = await ethers.getContractFactory("KIP17Full");
    const deployedKIP17Full = KIP17Full.attach(collectionInfo[1]);
    let tokenId = await deployedKIP17Full.tokenOfOwnerByIndex(addr1.address, 0);
    expect(await deployedKIP17Full.tokenURI(tokenId)).to.equal("test");
    tokenId = await deployedKIP17Full.tokenOfOwnerByIndex(addr1.address, 1);
    expect(await deployedKIP17Full.tokenURI(tokenId)).to.equal("test1");
  })

  it("Approve All token to spend by another Wallet", async function () {
    const GameTokenFactory = await ethers.getContractFactory("GameTokenFactory");
    const deployedGameTokenFactory = await GameTokenFactory.deploy();
    await deployedGameTokenFactory.deployed();
    const [owner, addr1, addr2] = await ethers.getSigners();

    await deployedGameTokenFactory.changeDeveloperStatus(addr1.address, true);


    await deployedGameTokenFactory.connect(addr1).createCollection("TestCollection", "TestCollection");
    const collectionDetails = await deployedGameTokenFactory.getCollectionListByDeveloper(addr1.address);
    await deployedGameTokenFactory.connect(addr1).mintCollection(collectionDetails[0], addr1.address, "test");
    await deployedGameTokenFactory.connect(addr1).mintCollection(collectionDetails[0], addr1.address, "test");

    const collectionList = await deployedGameTokenFactory.getCollectionListByDeveloper(
      addr1.address
    );
    const collectionInfo = await deployedGameTokenFactory.collectionDetails(Number(collectionList[0]));

    const KIP17Full = await ethers.getContractFactory("KIP17Full");
    const deployedKIP17Full = KIP17Full.attach(collectionInfo[1]);
    expect((await deployedKIP17Full.balanceOf(addr1.address))).to.equal(2);
    expect((await deployedKIP17Full.balanceOf(addr2.address))).to.equal(0);
    const tokenId = await deployedKIP17Full.tokenOfOwnerByIndex(addr1.address, 0);
    const secondtokenId = await deployedKIP17Full.tokenOfOwnerByIndex(addr1.address, 1);

    await deployedKIP17Full.connect(addr1).setApprovalForAll(owner.address, true);
    await deployedKIP17Full.transferFrom(addr1.address, addr2.address, tokenId);
    await deployedKIP17Full.transferFrom(addr1.address, addr2.address, secondtokenId);

    expect((await deployedKIP17Full.balanceOf(addr2.address))).to.equal(2);
    expect((await deployedKIP17Full.balanceOf(addr1.address))).to.equal(0);

  })
});
