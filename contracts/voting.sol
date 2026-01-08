// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public admin;
    bool public votingActive;

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidates.push(Candidate(_name, 0));
    }

    function startVoting() public onlyAdmin {
        votingActive = true;
    }

    function vote(uint256 candidateIndex) public {
        require(votingActive, "Voting not active");
        require(!hasVoted[msg.sender], "Already voted");

        candidates[candidateIndex].voteCount += 1;
        hasVoted[msg.sender] = true;
    }

    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }
}
