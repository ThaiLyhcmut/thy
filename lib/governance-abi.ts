import { parseAbi } from "viem"

// Governance ABI - mainly view functions since governance is community-driven
export const GOVERNANCE_ABI = parseAbi([
  // Proposal management
  "function propose(address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, string description) returns (uint256)",
  "function cancel(uint256 proposalId)",
  "function execute(uint256 proposalId)",
  
  // Voting functions
  "function castVote(uint256 proposalId, uint8 support) returns (uint256)",
  "function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)",
  "function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s) returns (uint256)",
  
  // Governance views - simplified without complex structs
  "function state(uint256 proposalId) view returns (uint8)",
  "function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)",
  "function hasVoted(uint256 proposalId, address account) view returns (bool)",
  
  // Configuration
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)", 
  "function proposalThreshold() view returns (uint256)",
  "function quorumVotes() view returns (uint256)",
  "function owner() view returns (address)",
])