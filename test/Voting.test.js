const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting, voting, owner, voter1, voter2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, voter1, voter2] = await ethers.getSigners();
    voting = await Voting.deploy();
    await voting.waitForDeployment();

  });

  it("Should allow owner to add candidates", async function () {
    await voting.addCandidate("Alice");
    await voting.addCandidate("Bob");

    const candidate = await voting.getCandidate(1);
    expect(candidate[0]).to.equal("Alice");
  });

  it("Should allow a voter to vote only once", async function () {
    await voting.addCandidate("Alice");

    await voting.connect(voter1).vote(1);

    await expect(
      voting.connect(voter1).vote(1)
    ).to.be.revertedWith("Already voted");
  });

  it("Should count votes correctly", async function () {
    await voting.addCandidate("Alice");

    await voting.connect(voter1).vote(1);
    await voting.connect(voter2).vote(1);

    const candidate = await voting.getCandidate(1);
    expect(candidate[1]).to.equal(2);
  });
});
