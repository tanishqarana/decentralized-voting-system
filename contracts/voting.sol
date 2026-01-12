// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {

    // Address of the contract owner (deployer)
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Candidate structure
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Total number of candidates
    uint public candidatesCount;

    // Mapping: candidate id => Candidate
    mapping(uint => Candidate) public candidates;

    // Mapping: voter address => voted or not
    mapping(address => bool) public hasVoted;

    // Events (for transparency)
    event CandidateAdded(uint id, string name);
    event VoteCasted(address voter, uint candidateId);

    // Modifier: only owner can add candidates
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Add a new candidate (only owner)
    function addCandidate(string memory _name) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            0
        );

        emit CandidateAdded(candidatesCount, _name);
    }

    // Vote for a candidate
    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCasted(msg.sender, _candidateId);
    }

    // Get candidate details
    function getCandidate(uint _id) public view returns (string memory, uint) {
        Candidate memory c = candidates[_id];
        return (c.name, c.voteCount);
    }
}
