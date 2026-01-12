import { ethers } from "ethers";
import { VOTING_CONTRACT_ADDRESS } from "./constants";
import VotingABI from "./abi/Voting.json";

// extract ABI once
const ABI = VotingABI.abi;

export const getVotingContract = (signerOrProvider) => {
  return new ethers.Contract(
    VOTING_CONTRACT_ADDRESS,
    ABI,
    signerOrProvider
  );
};
