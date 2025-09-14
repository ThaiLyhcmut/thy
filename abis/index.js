// THY Token Ecosystem - Contract ABIs and Addresses
// Generated ABI files for frontend integration

import ThailyTokenABI from './ThailyToken.json';
import THYLiquidityMiningABI from './THYLiquidityMining.json';
import THYStakingABI from './THYStaking.json';
import THYGovernanceABI from './THYGovernance.json';
import THYPaymentGatewayABI from './THYPaymentGateway.json';
import MockUniswapV2PairABI from './MockUniswapV2Pair.json';

// Contract Addresses (Sepolia Testnet)
export const CONTRACTS = {
  THY_TOKEN: {
    address: '0xEc11b5cFF2C929379E66e429cdA6A8D0889109D5',
    abi: ThailyTokenABI
  },
  THY_STAKING: {
    address: '0x5985545CCe0Eb0859C67cf87C559b95AC59FD6D1',
    abi: THYStakingABI
  },
  THY_GOVERNANCE: {
    address: '0x424560Ac25eA02575F378BA5eD15E3f473D4b6D6',
    abi: THYGovernanceABI
  },
  THY_PAYMENT_GATEWAY: {
    address: '0xa7c6F0a4F6f928ED813F55De5C93a86e6bD3Abbe',
    abi: THYPaymentGatewayABI
  },
  THY_LIQUIDITY_MINING: {
    address: '0x4A5a782A54ce5B3F79b681347A66846DC34E8e7a',
    abi: THYLiquidityMiningABI
  },
  LP_TOKEN: {
    address: '0x74564A0a923e2b362576a93aaf4910059010FB7B',
    abi: MockUniswapV2PairABI
  }
};

// Individual ABI exports
export {
  ThailyTokenABI,
  THYLiquidityMiningABI,
  THYStakingABI,
  THYGovernanceABI,
  THYPaymentGatewayABI,
  MockUniswapV2PairABI
};

// Address exports
export const ADDRESSES = {
  THY_TOKEN: '0xEc11b5cFF2C929379E66e429cdA6A8D0889109D5',
  THY_STAKING: '0x5985545CCe0Eb0859C67cf87C559b95AC59FD6D1',
  THY_GOVERNANCE: '0x424560Ac25eA02575F378BA5eD15E3f473D4b6D6',
  THY_PAYMENT_GATEWAY: '0xa7c6F0a4F6f928ED813F55De5C93a86e6bD3Abbe',
  THY_LIQUIDITY_MINING: '0x4A5a782A54ce5B3F79b681347A66846DC34E8e7a',
  LP_TOKEN: '0x74564A0a923e2b362576a93aaf4910059010FB7B'
};

// Network configuration
export const NETWORK = {
  chainId: 11155111, // Sepolia
  name: 'Sepolia Testnet',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  blockExplorer: 'https://sepolia.etherscan.io'
};