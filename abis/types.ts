// THY Token Ecosystem - TypeScript Type Definitions

export interface ContractAddresses {
  THY_TOKEN: string;
  THY_STAKING: string;
  THY_GOVERNANCE: string;
  THY_PAYMENT_GATEWAY: string;
  THY_LIQUIDITY_MINING: string;
  LP_TOKEN: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
}

export interface ContractInfo {
  address: string;
  abi: any[];
}

export interface ContractsConfig {
  THY_TOKEN: ContractInfo;
  THY_STAKING: ContractInfo;
  THY_GOVERNANCE: ContractInfo;
  THY_PAYMENT_GATEWAY: ContractInfo;
  THY_LIQUIDITY_MINING: ContractInfo;
  LP_TOKEN: ContractInfo;
}

// Staking related types
export interface StakeInfo {
  amount: string;
  rewardDebt: string;
  lockEndTime: string;
  autoCompound: boolean;
  poolId: number;
}

export interface PoolInfo {
  lockPeriod: number;
  rewardRate: number;
  minStakeAmount: string;
  totalStaked: string;
  active: boolean;
}

// Liquidity Mining types
export interface UserStats {
  stakedAmount: string;
  pendingRewards: string;
  totalClaimed: string;
  tierMultiplier: number;
  tierName: string;
  stakingDuration: number;
}

export interface PoolStats {
  totalStaked: string;
  totalRewardsDistributed: string;
  totalUsers: number;
  totalFeesCollected: string;
  currentAPR: number;
}

// Governance types
export interface ProposalInfo {
  id: number;
  proposer: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  startBlock: number;
  endBlock: number;
  description: string;
}

export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
}

// Payment Gateway types
export interface PaymentInfo {
  id: number;
  payer: string;
  merchant: string;
  amount: string;
  token: string;
  status: PaymentStatus;
  timestamp: number;
  description: string;
}

export enum PaymentStatus {
  Pending,
  Confirmed,
  Refunded,
  Canceled
}

// Contract method types
export interface ThailyTokenMethods {
  // ERC-20 methods
  balanceOf: (account: string) => Promise<string>;
  transfer: (to: string, amount: string) => Promise<void>;
  approve: (spender: string, amount: string) => Promise<void>;
  allowance: (owner: string, spender: string) => Promise<string>;

  // Extended methods
  mint: (to: string, amount: string) => Promise<void>;
  burn: (amount: string) => Promise<void>;
  pause: () => Promise<void>;
  unpause: () => Promise<void>;
  paused: () => Promise<boolean>;
}

export interface THYLiquidityMiningMethods {
  deposit: (amount: string) => Promise<void>;
  withdraw: (amount: string) => Promise<void>;
  claimRewards: () => Promise<void>;
  pendingReward: (user: string) => Promise<string>;
  getUserStats: (user: string) => Promise<UserStats>;
  getPoolStats: () => Promise<PoolStats>;
}

export interface THYStakingMethods {
  stake: (poolId: number, amount: string, autoCompound: boolean) => Promise<void>;
  withdraw: (stakeId: number) => Promise<void>;
  getStakeInfo: (user: string, stakeId: number) => Promise<StakeInfo>;
  getUserStakes: (user: string) => Promise<StakeInfo[]>;
  getPoolInfo: (poolId: number) => Promise<PoolInfo>;
}

// Event types
export interface TransferEvent {
  from: string;
  to: string;
  value: string;
}

export interface DepositEvent {
  user: string;
  amount: string;
  depositFee: string;
}

export interface StakedEvent {
  user: string;
  stakeId: number;
  amount: string;
  lockPeriod: number;
  apy: number;
}