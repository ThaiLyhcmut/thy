import { createPublicClient, createWalletClient, custom, http, parseAbi } from "viem"
import { sepolia } from "viem/chains"
import { PAYMENT_GATEWAY_ABI } from "./payment-gateway-abi"
import { GOVERNANCE_ABI } from "./governance-abi"

// Contract addresses - Updated September 15, 2025 (LATEST DEPLOYMENT)
export const CONTRACTS = {
  THY_TOKEN: "0xE32B76EC0Bf09F20f9C1fa3200fFEd5E8979C6d7" as `0x${string}`,
  THY_LIQUIDITY_MINING: "0x3902DF4a9Fd5d59BF8A6c35c276096CE26153BB4" as `0x${string}`,
  THY_PAYMENT_GATEWAY: "0xf786EAe3757e2E4dE3283Ff61FE99647b3C37b20" as `0x${string}`,
  THY_STAKING: "0x63e9092655a6671C59E08Fcd6Bb2540dCbEB07D8" as `0x${string}`,
  THY_GOVERNANCE: "0x20Cbb8a108A577Ac3C65bCEC5d38Ce1469b4CB5c" as `0x${string}`,
  MOCK_UNISWAP_V2_PAIR: "0x88af65ACcb320d4d831f507a66242C6c94dCC90A" as `0x${string}`,
  // Aliases for backward compatibility
  LIQUIDITY_MINING: "0x3902DF4a9Fd5d59BF8A6c35c276096CE26153BB4" as `0x${string}`,
  PAYMENT_GATEWAY: "0xf786EAe3757e2E4dE3283Ff61FE99647b3C37b20" as `0x${string}`,
  STAKING_CONTRACT: "0x63e9092655a6671C59E08Fcd6Bb2540dCbEB07D8" as `0x${string}`,
  GOVERNANCE: "0x20Cbb8a108A577Ac3C65bCEC5d38Ce1469b4CB5c" as `0x${string}`,
  LP_TOKEN: "0x88af65ACcb320d4d831f507a66242C6c94dCC90A" as `0x${string}`,
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
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function renounceOwnership()",
])

// Liquidity Mining ABI (key functions)
export const LIQUIDITY_MINING_ABI = parseAbi([
  // User functions
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimRewards()",
  "function emergencyWithdraw()",
  // View functions
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
  "function pool() view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accRewardPerShare, uint256 depositFeeBP, uint256 withdrawFeeBP)",
  // Owner/Admin functions
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function renounceOwnership()",
  "function setRewardPerBlock(uint256 _rewardPerBlock)",
  "function updatePoolInfo(uint256 _allocPoint, uint256 _depositFeeBP, uint256 _withdrawFeeBP)",
  "function setBonusMultiplier(uint256 _bonusMultiplier)",
  "function toggleEmergencyMode()",
  // Events
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

// Export ABIs
export { PAYMENT_GATEWAY_ABI, GOVERNANCE_ABI }
