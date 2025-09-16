import { parseAbi } from "viem"

// Payment Gateway ABI based on THYPaymentGateway contract
export const PAYMENT_GATEWAY_ABI = parseAbi([
  // Merchant registration
  "function registerMerchant(string name, string website)",
  
  // Payment operations
  "function createPayment(address payer, uint256 amount, string orderId, string metadata) returns (bytes32)",
  "function processPayment(bytes32 paymentId)",
  "function refundPayment(bytes32 paymentId)",
  
  // Payment queries
  "function getPaymentInfo(bytes32 paymentId) view returns (address payer, address merchant, uint256 amount, uint256 discountAmount, uint256 finalAmount, uint8 status, uint256 timestamp, uint256 expiryTime, string orderId)",
  "function getUserPayments(address user) view returns (bytes32[])",
  "function getMerchantPayments(address merchant) view returns (bytes32[])",
  
  // Merchant queries
  "function getMerchantInfo(address merchant) view returns (string name, string website, bool active, uint256 totalReceived, uint256 feesOwed)",
  "function merchants(address) view returns (address walletAddress, string name, string website, bool active, uint256 totalReceived, uint256 feesOwed, uint256 registrationTime)",
  
  // Discount calculation
  "function calculateDiscount(address payer, uint256 amount) view returns (uint256 discount, uint256 finalAmount)",
  "function hasStakingBonus(address user) view returns (bool)",
  
  // Public variables
  "function thyToken() view returns (address)",
  "function stakingContract() view returns (address)",
  "function processingFee() view returns (uint256)",
  "function totalVolume() view returns (uint256)",
  "function totalFees() view returns (uint256)",
  
  // Admin functions
  "function owner() view returns (address)",
  "function setStakingContract(address stakingContract)",
  "function setProcessingFee(uint256 fee)",
  "function toggleMerchant(address merchant)",
  "function withdrawFees(uint256 amount)",
  "function pause()",
  "function unpause()",
  
  // Events
  "event PaymentCreated(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amount, uint256 finalAmount, string orderId)",
  "event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amount)",
  "event PaymentRefunded(bytes32 indexed paymentId, address indexed payer, uint256 amount)",
  "event MerchantRegistered(address indexed merchant, string name)",
  "event DiscountApplied(bytes32 indexed paymentId, uint256 originalAmount, uint256 discountAmount, uint256 finalAmount)",
])