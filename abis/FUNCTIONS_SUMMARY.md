# 📋 THY Token Ecosystem - Contract Functions Summary

**Complete ABI functions cho từng contract với input/output parameters**

---

## 🪙 ThailyToken (`0xEc11b5cFF2C929379E66e429cdA6A8D0889109D5`)

### Core ERC-20 Functions
```javascript
// Transfer functions
transfer(to: address, value: uint256) → bool
transferFrom(from: address, to: address, value: uint256) → bool
approve(spender: address, value: uint256) → bool

// View functions
balanceOf(account: address) → uint256
allowance(owner: address, spender: address) → uint256
totalSupply() → uint256
name() → string // Returns "Thaily Token"
symbol() → string // Returns "THY"
decimals() → uint8 // Returns 18
```

### Extended Functions
```javascript
// Mint/Burn (Owner only)
mint(to: address, amount: uint256) → void
burn(value: uint256) → void
burnFrom(account: address, value: uint256) → void

// Pausable controls
pause() → void // Owner only
unpause() → void // Owner only
paused() → bool

// Owner management
owner() → address
transferOwnership(newOwner: address) → void
renounceOwnership() → void

// Constants
MAX_SUPPLY() → uint256 // Returns 1000000 * 10^18
version() → string // Returns "1.0.0"
```

---

## 🌾 THYLiquidityMining (`0x4A5a782A54ce5B3F79b681347A66846DC34E8e7a`)

### Core Farming Functions
```javascript
// Staking operations
deposit(amount: uint256) → void
withdraw(amount: uint256) → void
claimRewards() → void
emergencyWithdraw() → void

// View functions
pendingReward(user: address) → uint256
getUserTier(user: address) → (tierIndex: uint256, multiplier: uint256, tierName: string)
getPoolStats() → (totalStaked: uint256, totalRewardsDistributed: uint256, totalUsers: uint256, totalFeesCollected: uint256, currentAPR: uint256)
getUserStats(user: address) → (stakedAmount: uint256, pendingRewards: uint256, totalClaimed: uint256, tierMultiplier: uint256, tierName: string, stakingDuration: uint256)
```

### Pool Configuration
```javascript
// Pool parameters
rewardPerBlock() → uint256
startBlock() → uint256
bonusEndBlock() → uint256
bonusMultiplier() → uint256
pool() → (lpToken: address, allocPoint: uint256, lastRewardBlock: uint256, accRewardPerShare: uint256, depositFeeBP: uint256, withdrawFeeBP: uint256)

// Admin functions (Owner only)
setRewardPerBlock(rewardPerBlock: uint256) → void
updatePoolInfo(allocPoint: uint256, depositFeeBP: uint256, withdrawFeeBP: uint256) → void
setBonusMultiplier(bonusMultiplier: uint256) → void
toggleEmergencyMode() → void
```

---

## 🏦 THYStaking (`0x5985545CCe0Eb0859C67cf87C559b95AC59FD6D1`)

### Staking Operations
```javascript
// Multi-pool staking
stake(poolId: uint256, amount: uint256, autoCompound: bool) → void
withdraw(stakeId: uint256) → void
emergencyWithdraw(stakeId: uint256) → void
compoundRewards(stakeId: uint256) → void

// View functions
getStakeInfo(user: address, stakeId: uint256) → StakeInfo
calculateRewards(user: address, stakeId: uint256) → uint256
getUserStakes(user: address) → StakeInfo[]
getPoolInfo(poolId: uint256) → PoolInfo
```

### Pool Management
```javascript
// Admin functions
createPool(lockPeriod: uint256, rewardRate: uint256, minStakeAmount: uint256) → void
updatePool(poolId: uint256, rewardRate: uint256, minStakeAmount: uint256, active: bool) → void
fundRewardPool(amount: uint256) → void
setEarlyWithdrawPenalty(penalty: uint256) → void

// Pool constants
activePools(index: uint256) → PoolInfo
earlyWithdrawPenalty() → uint256 // 2500 = 25%
```

---

## 🗳️ THYGovernance (`0x424560Ac25eA02575F378BA5eD15E3f473D4b6D6`)

### Proposal Management
```javascript
// Create and manage proposals
propose(targets: address[], values: uint256[], signatures: string[], calldatas: bytes[], description: string) → uint256
cancel(proposalId: uint256) → void
execute(proposalId: uint256) → void

// Voting functions
castVote(proposalId: uint256, support: uint8) → uint256
castVoteWithReason(proposalId: uint256, support: uint8, reason: string) → uint256
castVoteBySig(proposalId: uint256, support: uint8, v: uint8, r: bytes32, s: bytes32) → uint256
```

### Governance Views
```javascript
// Proposal information
getProposal(proposalId: uint256) → ProposalInfo
state(proposalId: uint256) → ProposalState
proposalVotes(proposalId: uint256) → (againstVotes: uint256, forVotes: uint256, abstainVotes: uint256)
hasVoted(proposalId: uint256, account: address) → bool
getReceipt(proposalId: uint256, voter: address) → Receipt

// Configuration
votingDelay() → uint256
votingPeriod() → uint256
proposalThreshold() → uint256
quorumVotes() → uint256
```

---

## 💳 THYPaymentGateway (`0xa7c6F0a4F6f928ED813F55De5C93a86e6bD3Abbe`)

### Payment Processing
```javascript
// Payment operations
createPayment(amount: uint256, token: address, description: string) → uint256
processPayment(paymentId: uint256) → void
refundPayment(paymentId: uint256) → void
confirmPayment(paymentId: uint256) → void

// Payment queries
getPayment(paymentId: uint256) → PaymentInfo
getUserPayments(user: address) → uint256[]
getMerchantPayments(merchant: address) → uint256[]
```

### Merchant Management
```javascript
// Merchant functions
registerMerchant(merchantInfo: MerchantInfo) → void
updateMerchantInfo(merchantId: uint256, newInfo: MerchantInfo) → void
setMerchantStatus(merchantId: uint256, active: bool) → void

// Fee configuration
setFeeRate(token: address, feeRate: uint256) → void
getFeeRate(token: address) → uint256
withdrawFees(token: address) → void
```

---

## 🔄 MockUniswapV2Pair (`0x74564A0a923e2b362576a93aaf4910059010FB7B`)

### LP Token Functions
```javascript
// ERC-20 LP token functions
transfer(to: address, value: uint256) → bool
transferFrom(from: address, to: address, value: uint256) → bool
approve(spender: address, value: uint256) → bool
balanceOf(account: address) → uint256
totalSupply() → uint256

// Pair information
token0() → address
token1() → address
getReserves() → (reserve0: uint112, reserve1: uint112, blockTimestampLast: uint32)
```

### Mock Functions
```javascript
// Testing utilities
mint(to: address, amount: uint256) → void
burn(amount: uint256) → void
setReserves(reserve0: uint112, reserve1: uint112) → void
```

---

## 🎯 Usage Examples

### Web3.js Integration
```javascript
import { CONTRACTS, ADDRESSES } from './abis/index.js';

// Initialize contracts
const thyToken = new web3.eth.Contract(CONTRACTS.THY_TOKEN.abi, CONTRACTS.THY_TOKEN.address);
const liquidityMining = new web3.eth.Contract(CONTRACTS.THY_LIQUIDITY_MINING.abi, CONTRACTS.THY_LIQUIDITY_MINING.address);

// Check balance
const balance = await thyToken.methods.balanceOf(userAddress).call();

// Deposit to farming
await thyToken.methods.approve(ADDRESSES.THY_LIQUIDITY_MINING, amount).send({from: userAddress});
await liquidityMining.methods.deposit(amount).send({from: userAddress});
```

### Ethers.js Integration
```javascript
import { ethers } from 'ethers';
import { CONTRACTS } from './abis/index.js';

// Initialize contracts
const thyToken = new ethers.Contract(CONTRACTS.THY_TOKEN.address, CONTRACTS.THY_TOKEN.abi, signer);
const staking = new ethers.Contract(CONTRACTS.THY_STAKING.address, CONTRACTS.THY_STAKING.abi, signer);

// Stake tokens
await thyToken.approve(CONTRACTS.THY_STAKING.address, amount);
await staking.stake(poolId, amount, autoCompound);
```

---

## ⚠️ Important Notes

### Function Access Control
- **Public**: Anyone can call
- **Owner only**: Only contract owner
- **User only**: Only affects caller's assets

### Gas Optimization
- Batch operations when possible
- Check allowances before approvals
- Use view functions for queries

### Error Handling
- Always handle transaction failures
- Check contract pause state
- Validate input parameters

**🔗 All contracts deployed on Sepolia Testnet and verified on Etherscan**