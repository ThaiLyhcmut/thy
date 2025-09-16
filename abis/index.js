// THY Token Ecosystem - Contract ABIs and Addresses
// Generated ABI files for frontend integration

import ThailyTokenABI from './ThailyToken.json';
import THYLiquidityMiningABI from './THYLiquidityMining.json';
import THYStakingABI from './THYStaking.json';
import THYGovernanceABI from './THYGovernance.json';
import THYPaymentGatewayABI from './THYPaymentGateway.json';
import MockUniswapV2PairABI from './MockUniswapV2Pair.json';

// Contract Addresses (Sepolia Testnet) - Updated September 15, 2025 (BUG FIXED)
export const CONTRACTS = {
  THY_TOKEN: {
    address: '0xE32B76EC0Bf09F20f9C1fa3200fFEd5E8979C6d7',
    abi: ThailyTokenABI
  },
  THY_STAKING: {
    address: '0x63e9092655a6671C59E08Fcd6Bb2540dCbEB07D8',
    abi: THYStakingABI
  },
  THY_GOVERNANCE: {
    address: '0x20Cbb8a108A577Ac3C65bCEC5d38Ce1469b4CB5c',
    abi: THYGovernanceABI
  },
  THY_PAYMENT_GATEWAY: {
    address: '0xf786EAe3757e2E4dE3283Ff61FE99647b3C37b20',
    abi: THYPaymentGatewayABI
  },
  THY_LIQUIDITY_MINING: {
    address: '0x3902DF4a9Fd5d59BF8A6c35c276096CE26153BB4',
    abi: THYLiquidityMiningABI
  },
  LP_TOKEN: {
    address: '0x88af65ACcb320d4d831f507a66242C6c94dCC90A',
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
  THY_TOKEN: '0xE32B76EC0Bf09F20f9C1fa3200fFEd5E8979C6d7',
  THY_STAKING: '0x63e9092655a6671C59E08Fcd6Bb2540dCbEB07D8',
  THY_GOVERNANCE: '0x20Cbb8a108A577Ac3C65bCEC5d38Ce1469b4CB5c',
  THY_PAYMENT_GATEWAY: '0xf786EAe3757e2E4dE3283Ff61FE99647b3C37b20',
  THY_LIQUIDITY_MINING: '0x3902DF4a9Fd5d59BF8A6c35c276096CE26153BB4',
  LP_TOKEN: '0x88af65ACcb320d4d831f507a66242C6c94dCC90A'
};

// Network configuration
export const NETWORK = {
  chainId: 11155111, // Sepolia
  name: 'Sepolia Testnet',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  blockExplorer: 'https://sepolia.etherscan.io'
};