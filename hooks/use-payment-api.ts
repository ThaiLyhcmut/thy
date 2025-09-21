"use client"

import { useState, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { useChainCheck } from "./use-chain-check"
import { publicClient, CONTRACTS, PAYMENT_GATEWAY_ABI, THY_TOKEN_ABI } from "@/lib/web3"
import { parseUnits } from "viem"
import { sepolia } from "viem/chains"
import type { Hash } from "viem"

export interface PaymentRequest {
  id?: string
  _id?: string
  paymentId?: string // legacy field
  blockchainPaymentId?: string // actual blockchain payment ID
  amount: string | number // Can be wei string or THY number
  finalAmount?: string // discounted amount in wei
  discountAmount?: string // discount in wei
  currency: string
  orderId: string
  customerAddress: string
  metadata: {
    description: string
    imageCount: number
    type: string
    pricePerImage?: number
  }
  status: string
  createdAt: string | { $date: string }
  expiryTime: string | { $date: string }
  transactionHash?: string | null
}

interface PaymentResponse {
  success: boolean
  payment?: PaymentRequest
  error?: string
}

interface ProcessResponse {
  success: boolean
  message?: string
  error?: string
}

const API_BASE_URL = "https://thygateaway.thaily.id.vn"
const MERCHANT_API_KEY = "thy_d96ada63160fa4575f0ed14f428edab07ed9adfe108c11f6b8ad79ac20c7e8a9"

export function usePaymentApi() {
  const { address, walletClient, isConnected } = useWallet()
  const { ensureCorrectChain } = useChainCheck()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPayment, setCurrentPayment] = useState<PaymentRequest | null>(null)
  const [allowanceStatus, setAllowanceStatus] = useState<'checking' | 'insufficient' | 'sufficient' | 'error'>('checking')
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(BigInt(0))

  const PRICE_PER_IMAGE = 0.01

  // Check THY allowance on component mount
  const checkAllowance = useCallback(async (requiredAmount?: number) => {
    if (!address || !isConnected) {
      setAllowanceStatus('error')
      return false
    }

    setAllowanceStatus('checking')
    setError(null)

    try {
      console.log(`🔍 Checking allowance for payment amount: ${requiredAmount || 'general check'} THY`)
      console.log(`📋 Verify on Etherscan: https://sepolia.etherscan.io/address/${CONTRACTS.THY_TOKEN}#readContract#F2`)
      console.log(`📝 Use owner: ${address}, spender: ${CONTRACTS.THY_PAYMENT_GATEWAY}`)

      // Check current allowance using the existing THY_TOKEN_ABI
      const allowance = await publicClient.readContract({
        address: CONTRACTS.THY_TOKEN,
        abi: THY_TOKEN_ABI,
        functionName: "allowance",
        args: [address as `0x${string}`, CONTRACTS.THY_PAYMENT_GATEWAY],
      })

      setCurrentAllowance(allowance as bigint)
      console.log(`Current allowance: ${allowance} wei (${(allowance as bigint).toString()})`)

      // If requiredAmount is specified, check if allowance is sufficient
      if (requiredAmount !== undefined) {
        // Convert THY to wei properly
        const requiredAmountBigInt = parseUnits(requiredAmount.toString(), 18)
        const sufficient = (allowance as bigint) >= requiredAmountBigInt

        console.log(`Required amount: ${requiredAmount} THY = ${requiredAmountBigInt} wei`)
        console.log(`Allowance sufficient: ${sufficient}`)

        setAllowanceStatus(sufficient ? 'sufficient' : 'insufficient')
        return sufficient
      } else {
        // Just checking general allowance status
        const hasAllowance = (allowance as bigint) > BigInt(0)
        console.log(`General allowance check - has allowance: ${hasAllowance}`)
        setAllowanceStatus(hasAllowance ? 'sufficient' : 'insufficient')
        return true
      }
    } catch (err) {
      console.error('Allowance check failed:', err)
      setError('Failed to check THY allowance')
      setAllowanceStatus('error')
      return false
    }
  }, [address, isConnected])

  // Approve THY tokens function
  const approveThyToken = useCallback(async (amount: number): Promise<boolean> => {
    if (!walletClient || !address) {
      setError("Wallet not connected")
      return false
    }

    // Ensure correct chain
    const chainSwitched = await ensureCorrectChain()
    if (!chainSwitched) {
      setError("Please switch to Sepolia network")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const amountBigInt = parseUnits(amount.toString(), 18)

      console.log(`Approving ${amount} THY to Payment Gateway`)

      const approveHash = await walletClient.writeContract({
        address: CONTRACTS.THY_TOKEN,
        abi: THY_TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.THY_PAYMENT_GATEWAY, amountBigInt],
        account: address as `0x${string}`,
        chain: sepolia,
      })

      await publicClient.waitForTransactionReceipt({ hash: approveHash })
      console.log("Approval confirmed")

      // Recheck allowance after approval
      await checkAllowance(amount)

      return true
    } catch (err) {
      console.error('Approval failed:', err)
      setError(err instanceof Error ? err.message : 'Approval failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, address, ensureCorrectChain, checkAllowance])

  // Step 1: Merchant tạo Payment Request qua API
  const createPaymentRequest = useCallback(
    async (imageCount: number, description: string): Promise<PaymentRequest | null> => {
      if (!address) {
        setError("Wallet not connected")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const totalAmount = imageCount * PRICE_PER_IMAGE
        const orderId = `images_${imageCount}_${Date.now()}`

        const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
          method: 'POST',
          headers: {
            'X-API-Key': MERCHANT_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: totalAmount, // number, not string
            currency: 'THY',
            orderId: orderId,
            customerAddress: address,
            metadata: { // object, not string
              description: description,
              imageCount: imageCount,
              type: 'image_generation',
              pricePerImage: PRICE_PER_IMAGE
            },
            webhookUrl: 'https://thy.thaily.id.vn/webhook'
          })
        })

        const result: PaymentResponse = await response.json()

        if (result.success && result.payment) {
          setCurrentPayment(result.payment)
          return result.payment
        } else {
          throw new Error(result.error || 'Payment creation failed')
        }
      } catch (err) {
        console.error('Payment request creation failed:', err)
        setError(err instanceof Error ? err.message : 'Payment creation failed')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [address]
  )

  // Step 2: Frontend User thực hiện thanh toán trên blockchain
  const processPaymentOnChain = useCallback(
    async (paymentRequest: PaymentRequest): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      // Ensure correct chain
      const chainSwitched = await ensureCorrectChain()
      if (!chainSwitched) {
        setError("Please switch to Sepolia network")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        // Validate payment request data
        console.log('💳 Payment Request Data:', {
          id: paymentRequest.id,
          paymentId: paymentRequest.paymentId,
          blockchainPaymentId: paymentRequest.blockchainPaymentId,
          amount: paymentRequest.amount,
          finalAmount: paymentRequest.finalAmount,
          currency: paymentRequest.currency,
          status: paymentRequest.status
        })

        // Use blockchainPaymentId if available, fallback to paymentId
        const blockchainPaymentId = paymentRequest.blockchainPaymentId || paymentRequest.paymentId
        if (!blockchainPaymentId) {
          throw new Error(`Blockchain Payment ID is undefined. Available fields: ${Object.keys(paymentRequest).join(', ')}`)
        }

        console.log(`Using blockchain payment ID: ${blockchainPaymentId}`)

        // Handle different amount formats from backend
        let amountBigInt: bigint
        const amountStr = paymentRequest.amount.toString()

        // Check if amount is in wei format (very large number) or THY format
        if (amountStr.length > 10 && /^\d+$/.test(amountStr)) {
          // If it's a very large number with only digits, treat as wei
          amountBigInt = BigInt(paymentRequest.amount)
          console.log(`Amount from backend (wei): ${paymentRequest.amount}`)
        } else {
          // If it's a smaller number or has decimal, treat as THY and convert to wei
          const thyAmount = parseFloat(amountStr)
          amountBigInt = parseUnits(thyAmount.toString(), 18)
          console.log(`Amount as THY: ${thyAmount}, converted to wei: ${amountBigInt}`)
        }

        // 1. Check current allowance from smart contract
        console.log(`Checking allowance for ${address} to ${CONTRACTS.THY_PAYMENT_GATEWAY}`)
        console.log(`📋 Verify on Etherscan: https://sepolia.etherscan.io/address/${CONTRACTS.THY_TOKEN}#readContract#F2`)
        console.log(`📝 Use owner: ${address}, spender: ${CONTRACTS.THY_PAYMENT_GATEWAY}`)

        const currentAllowance = await publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "allowance",
          args: [address as `0x${string}`, CONTRACTS.THY_PAYMENT_GATEWAY],
        })

        console.log(`Current allowance: ${currentAllowance} wei (${currentAllowance.toString()})`)
        console.log(`Required amount: ${amountBigInt} wei (${amountBigInt.toString()})`)
        console.log(`Payment amount: ${paymentRequest.amount} THY`)
        console.log(`Allowance sufficient: ${currentAllowance >= amountBigInt}`)

        // Only approve if allowance is insufficient
        if (typeof currentAllowance === 'bigint' && currentAllowance < amountBigInt) {
          // Approve max uint256 to avoid future approvals
          const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
          console.log(`Insufficient allowance. Approving UNLIMITED THY to Payment Gateway (one-time approval)`)

          const approveHash = await walletClient.writeContract({
            address: CONTRACTS.THY_TOKEN,
            abi: THY_TOKEN_ABI,
            functionName: "approve",
            args: [CONTRACTS.THY_PAYMENT_GATEWAY, maxUint256],
            account: address as `0x${string}`,
            chain: sepolia,
          })

          await publicClient.waitForTransactionReceipt({ hash: approveHash })
          console.log("Approval confirmed")
        } else {
          console.log(`✅ Sufficient allowance already exists (${currentAllowance} >= ${amountBigInt})`)
          console.log(`🚀 Skipping approval - proceeding directly to payment`)
        }

        // 2. Process payment directly on blockchain
        console.log(`Processing payment on blockchain with blockchain payment ID: ${blockchainPaymentId}`)
        console.log(`🔗 Payment Gateway Contract: https://sepolia.etherscan.io/address/${CONTRACTS.THY_PAYMENT_GATEWAY}#writeContract#F4`)

        // Convert hex string to bytes32 format for smart contract
        let paymentIdBytes32: `0x${string}`
        if (blockchainPaymentId.startsWith('0x')) {
          // If it's already a hex string, use it directly
          paymentIdBytes32 = blockchainPaymentId as `0x${string}`
          console.log(`Using hex payment ID: ${paymentIdBytes32}`)
        } else {
          // If it's a number string, convert to hex
          const paymentIdBigInt = BigInt(blockchainPaymentId)
          paymentIdBytes32 = `0x${paymentIdBigInt.toString(16).padStart(64, '0')}` as `0x${string}`
          console.log(`Converted payment ID to hex: ${paymentIdBytes32}`)
        }

        const processTx = await walletClient.writeContract({
          address: CONTRACTS.THY_PAYMENT_GATEWAY,
          abi: PAYMENT_GATEWAY_ABI,
          functionName: "processPayment",
          args: [paymentIdBytes32], // blockchain payment ID as bytes32
          account: address as `0x${string}`,
          chain: sepolia,
        })

        const receipt = await publicClient.waitForTransactionReceipt({ hash: processTx })
        console.log('Process transaction confirmed:', processTx)

        return processTx
      } catch (err) {
        console.error('Blockchain payment failed:', err)
        setError(err instanceof Error ? err.message : 'Blockchain payment failed')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [walletClient, address, ensureCorrectChain]
  )

  // Step 3: Send transaction hash to backend for monitoring
  const submitTransactionHash = useCallback(
    async (transactionHash: string, blockchainPaymentId: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        console.log(`🔗 Submitting transaction hash: ${transactionHash}`)
        console.log(`📋 View on Etherscan: https://sepolia.etherscan.io/tx/${transactionHash}`)
        console.log(`📝 Blockchain Payment ID: ${blockchainPaymentId}`)

        // Send transaction hash to backend for automatic monitoring
        // Backend expects blockchainPaymentId as the URL parameter
        const response = await fetch(`${API_BASE_URL}/api/payments/${blockchainPaymentId}/transaction`, {
          method: 'POST',
          headers: {
            'X-API-Key': MERCHANT_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            transactionHash: transactionHash
          })
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ Transaction hash submitted successfully!')
          console.log('⏳ Backend will monitor transaction automatically')
          console.log(`📊 Payment status: ${result.payment?.status}`)

          // Update current payment status to "processing"
          setCurrentPayment(prev => prev ? { ...prev, status: 'processing', transactionHash } : null)
          return true
        } else {
          console.error('❌ Transaction submission failed:', result.error)
          setError(result.error || 'Transaction submission failed')
          return false
        }
      } catch (err) {
        console.error('Transaction submission failed:', err)
        setError(err instanceof Error ? err.message : 'Transaction submission failed')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Complete payment flow with improved allowance checking
  const completePaymentFlow = useCallback(
    async (imageCount: number, description: string): Promise<boolean> => {
      try {
        const totalAmount = imageCount * PRICE_PER_IMAGE

        // Step 0: Check allowance first
        const allowanceOk = await checkAllowance(totalAmount)
        if (!allowanceOk && allowanceStatus === 'insufficient') {
          setError(`Insufficient THY allowance. Please approve ${totalAmount} THY first.`)
          return false
        }

        // Step 1: Create payment request
        const paymentRequest = await createPaymentRequest(imageCount, description)
        if (!paymentRequest) return false

        // Step 2: Process on blockchain
        const transactionHash = await processPaymentOnChain(paymentRequest)
        if (!transactionHash) return false

        // Step 3: Submit transaction hash to backend for monitoring
        const blockchainPaymentId = paymentRequest.blockchainPaymentId || paymentRequest.paymentId || ''
        const submitted = await submitTransactionHash(transactionHash, blockchainPaymentId)
        return submitted
      } catch (err) {
        console.error('Complete payment flow failed:', err)
        setError(err instanceof Error ? err.message : 'Payment flow failed')
        return false
      }
    },
    [createPaymentRequest, processPaymentOnChain, submitTransactionHash, checkAllowance, allowanceStatus, PRICE_PER_IMAGE]
  )

  // Get wallet points/credits from backend with rate limiting
  const getWalletPoints = useCallback(async () => {
    if (!address) return null

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/wallet/${address}/points`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Handle rate limiting
      if (response.status === 429) {
        console.warn('Rate limited - using cached wallet data')
        return null
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        return result.wallet
      }
      return null
    } catch (error) {
      console.error('Failed to fetch wallet points:', error)
      return null
    }
  }, [address])

  // Get payment stats from wallet points
  const getPaymentStats = useCallback(async () => {
    const walletPoints = await getWalletPoints()

    if (!walletPoints) {
      return {
        totalPaid: "0",
        availableCredits: 0,
        remainingCredits: 0,
        remainingValue: "0",
        totalPoints: 0,
        spentPoints: 0
      }
    }

    // totalPoints is already the available balance calculated by backend
    const availableCredits = Math.max(0, walletPoints.totalPoints) // Never show negative

    return {
      totalPaid: walletPoints.totalSpentTHY || "0",
      availableCredits: availableCredits,
      remainingCredits: availableCredits,
      remainingValue: (availableCredits * PRICE_PER_IMAGE).toString(),
      totalPoints: walletPoints.totalPoints,
      spentPoints: walletPoints.spentPoints,
      earnedPoints: walletPoints.earnedPoints || 0
    }
  }, [getWalletPoints, PRICE_PER_IMAGE])

  // Spend points for image generation
  const spendPointsForImages = useCallback(async (imageCount: number): Promise<boolean> => {
    if (!address) return false

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/wallet/${address}/points/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points: imageCount, // 1 point = 1 image
          description: `Generated ${imageCount} images`
        })
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Failed to spend points:', error)
      return false
    }
  }, [address])

  // Get all payments for current wallet address
  const getAllPayments = useCallback(async (): Promise<PaymentRequest[]> => {
    if (!address) {
      setError("Wallet not connected")
      return []
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/all/${address}`, {
        method: 'GET',
        headers: {
          'X-API-Key': MERCHANT_API_KEY,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.payments !== undefined) {
        return result.payments
      } else {
        throw new Error(result.error || 'Failed to fetch payments')
      }
    } catch (err) {
      console.error('Failed to fetch all payments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payments')
      return []
    }
  }, [address])

  const clearCurrentPayment = useCallback(() => {
    setCurrentPayment(null)
    setError(null)
  }, [])

  const setSelectedPayment = useCallback((payment: PaymentRequest | null) => {
    setCurrentPayment(payment)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    currentPayment,
    allowanceStatus,
    currentAllowance,
    PRICE_PER_IMAGE,

    // API methods
    checkAllowance,
    approveThyToken,
    createPaymentRequest,
    processPaymentOnChain,
    submitTransactionHash,
    completePaymentFlow,
    getPaymentStats,
    getWalletPoints,
    spendPointsForImages,
    getAllPayments,
    clearCurrentPayment,
    setSelectedPayment
  }
}