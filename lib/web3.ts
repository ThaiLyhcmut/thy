import { createPublicClient, createWalletClient, custom, http, parseAbi } from "viem"
import { sepolia } from "viem/chains"

// Contract addresses from the documentation
export const CONTRACTS = {
  THY_TOKEN: "0xEc11b5cFF2C929379E66e429cdA6A8D0889109D5",
  LIQUIDITY_MINING: "0x4A5a782A54ce5B3F79b681347A66846DC34E8e7a",
  PAYMENT_GATEWAY: "0xa7c6F0a4F6f928ED813F55De5C93a86e6bD3Abbe",
  STAKING_CONTRACT: "0x5985545CCe0Eb0859C67cf87C559b95AC59FD6D1",
  GOVERNANCE: "0x424560Ac25eA02575F378BA5eD15E3f473D4b6D6",
  LP_TOKEN: "0x74564A0a923e2b362576a93aaf4910059010FB7B",
} as const

// THY Token ABI (simplified for main functions)
export const THY_TOKEN_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function pause()",
  "function unpause()",
  "function paused() view returns (bool)",
])

// Liquidity Mining ABI (key functions)
export const LIQUIDITY_MINING_ABI = parseAbi([
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimRewards()",
  "function emergencyWithdraw()",
  "function pendingReward(address user) view returns (uint256)",
  "function getUserTier(address user) view returns (uint256 tierIndex, uint256 multiplier, string tierName)",
  "function getPoolStats() view returns (uint256 totalStaked, uint256 totalRewardsDistributed, uint256 totalUsers, uint256 totalFeesCollected, uint256 currentAPR)",
  "function getUserStats(address user) view returns (uint256 stakedAmount, uint256 pendingRewards, uint256 totalClaimed, uint256 tierMultiplier, string tierName, uint256 stakingDuration)",
  "function userInfo(address) view returns (uint256 amount, uint256 rewardDebt, uint256 depositTime)",
  "function rewardPerBlock() view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function startBlock() view returns (uint256)",
  "function endBlock() view returns (uint256)",
  "function bonusEndBlock() view returns (uint256)",
  "function bonusMultiplier() view returns (uint256)",
  "event Deposit(address indexed user, uint256 amount, uint256 depositFee)",
  "event Withdraw(address indexed user, uint256 amount, uint256 withdrawFee)",
  "event Claim(address indexed user, uint256 reward, uint256 multiplier)",
  "event EmergencyWithdraw(address indexed user, uint256 amount)",
])

// THY Staking ABI (key functions from documentation)
export const STAKING_ABI = parseAbi([
  // View functions
  "function activePools(uint256) view returns (uint256)",
  "function getActivePools() view returns (uint256[])",
  "function getStakeInfo(address _user, uint256 _stakeId) view returns (uint256 amount, uint256 startTime, uint256 lockPeriod, uint256 rewardRate, uint256 pendingReward, uint256 totalReward, bool withdrawn, bool canWithdraw)",
  "function getUserStakeCount(address _user) view returns (uint256)",
  "function getPoolInfo(uint256 _lockPeriod) view returns ((uint256,uint256,uint256,uint256,bool))",
  "function calculatePendingReward(uint256 _stakeId, address _user) view returns (uint256)",
  "function calculateTotalReward(uint256 _stakeId, address _user) view returns (uint256)",
  "function pools(uint256) view returns (uint256 lockPeriod, uint256 rewardRate, uint256 totalStaked, uint256 minStakeAmount, bool active)",
  "function stakes(address, uint256) view returns (uint256 amount, uint256 startTime, uint256 lockPeriod, uint256 rewardRate, uint256 lastRewardTime, uint256 accumulatedRewards, bool withdrawn, bool autoCompound)",
  "function nextStakeId() view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function totalRewardsPaid() view returns (uint256)",
  "function rewardPool() view returns (uint256)",
  "function thyToken() view returns (address)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function earlyWithdrawPenalty() view returns (uint256)",
  "function BASIS_POINTS() view returns (uint256)",

  // State-changing functions
  "function stake(uint256 _amount, uint256 _lockPeriod, bool _autoCompound)",
  "function withdraw(uint256 _stakeId)",
  "function emergencyWithdraw(uint256 _stakeId)",
  "function compoundRewards(uint256 _stakeId)",
  "function createPool(uint256 _lockPeriod, uint256 _rewardRate, uint256 _minStakeAmount)",
  "function addRewardPool(uint256 _amount)",
  "function updatePoolRewardRate(uint256 _lockPeriod, uint256 _newRate)",
  "function togglePool(uint256 _lockPeriod)",
  "function setEarlyWithdrawPenalty(uint256 _penalty)",
  "function pause()",
  "function unpause()",
  "function emergencyTokenRecovery(address _token, uint256 _amount)",
  "function transferOwnership(address newOwner)",
  "function renounceOwnership()",

  // Events
  "event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 lockPeriod, uint256 apy)",
  "event Withdrawn(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 reward)",
  "event RewardCompounded(address indexed user, uint256 indexed stakeId, uint256 reward)",
  "event EmergencyWithdraw(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 penalty)",
  "event PoolCreated(uint256 lockPeriod, uint256 rewardRate, uint256 minStakeAmount)",
  "event RewardPoolFunded(uint256 amount)",
])

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

// Create wallet client for transactions (will be initialized when wallet connects)
export const createWalletClientFromWindow = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum),
    })
  }
  return null
}

// Utility functions for formatting
export const formatTokenAmount = (amount: bigint, decimals = 18): string => {
  const divisor = BigInt(10 ** decimals)
  const quotient = amount / divisor
  const remainder = amount % divisor

  if (remainder === BigInt(0)) {
    return quotient.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, "0")
  const trimmedRemainder = remainderStr.replace(/0+$/, "")

  if (trimmedRemainder === "") {
    return quotient.toString()
  }

  return `${quotient}.${trimmedRemainder}`
}

export const parseTokenAmount = (amount: string, decimals = 18): bigint => {
  const [whole, fraction = ""] = amount.split(".")
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals)
  return BigInt(whole + paddedFraction)
}
