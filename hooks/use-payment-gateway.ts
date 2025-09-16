"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { useChainCheck } from "./use-chain-check"
import { publicClient, CONTRACTS, PAYMENT_GATEWAY_ABI } from "@/lib/web3"
import { parseUnits, formatUnits } from "viem"
import type { Hash } from "viem"
import { sepolia } from "viem/chains"

enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Expired = 2,
  Refunded = 3,
  Disputed = 4
}

interface PaymentInfo {
  paymentId: string
  payer: string
  merchant: string
  amount: string
  discountAmount: string
  finalAmount: string
  status: PaymentStatus
  timestamp: number
  expiryTime: number
  orderId: string
}

interface MerchantInfo {
  name: string
  website: string
  active: boolean
  totalReceived: string
  feesOwed: string
}

interface ImageGeneratorStats {
  totalPaid: string
  totalImages: number
  availableCredits: number
  paymentHistory: PaymentInfo[]
}

export function usePaymentGateway() {
  const { address, walletClient, isConnected } = useWallet()
  const { ensureCorrectChain } = useChainCheck()
  
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null)
  const [stats, setStats] = useState<ImageGeneratorStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Price per image: 0.01 THY = 1 image
  const PRICE_PER_IMAGE = 0.01

  // Check if current user is registered merchant
  const checkMerchantStatus = useCallback(async () => {
    if (!address || !isConnected) return

    try {
      const result = await publicClient.readContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "getMerchantInfo",
        args: [address as `0x${string}`],
      })

      // Check if result is valid array before destructuring
      if (Array.isArray(result) && result.length === 5) {
        const [name, website, active, totalReceived, feesOwed] = result as [string, string, boolean, bigint, bigint]

        if (active && name) {
          setMerchantInfo({
            name,
            website,
            active,
            totalReceived: formatUnits(totalReceived, 18),
            feesOwed: formatUnits(feesOwed, 18)
          })
        } else {
          setMerchantInfo(null)
        }
      } else {
        console.log("Invalid merchant info result:", result)
        setMerchantInfo(null)
      }
    } catch (err) {
      console.error("Failed to check merchant status:", err)
      setMerchantInfo(null)
    }
  }, [address, isConnected])

  // Get payment history and calculate stats
  const fetchPaymentStats = useCallback(async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      // Get user payment IDs
      const paymentIds = await publicClient.readContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "getUserPayments",
        args: [address as `0x${string}`],
      }) as `0x${string}`[]

      // Get payment details for each ID
      const payments: PaymentInfo[] = []
      let totalPaid = BigInt(0)
      let totalImages = 0
      let availableCredits = 0

      for (const paymentId of paymentIds) {
        try {
          const paymentInfo = await publicClient.readContract({
            address: CONTRACTS.THY_PAYMENT_GATEWAY,
            abi: PAYMENT_GATEWAY_ABI,
            functionName: "getPaymentInfo",
            args: [paymentId],
          })

          // Check if paymentInfo is valid array before destructuring
          if (Array.isArray(paymentInfo) && paymentInfo.length === 9) {
            const [payer, merchant, amount, discountAmount, finalAmount, status, timestamp, expiryTime, orderId] = paymentInfo as [string, string, bigint, bigint, bigint, number, bigint, bigint, string]

            const payment: PaymentInfo = {
              paymentId: paymentId,
              payer,
              merchant,
              amount: formatUnits(amount, 18),
              discountAmount: formatUnits(discountAmount, 18),
              finalAmount: formatUnits(finalAmount, 18),
              status: status as PaymentStatus,
              timestamp: Number(timestamp),
              expiryTime: Number(expiryTime),
              orderId
            }

            payments.push(payment)

            // Calculate stats for completed payments
            if (status === PaymentStatus.Completed) {
              totalPaid += finalAmount
              // Extract image count from orderId (format: "images_N")
              const imageCount = parseInt(orderId.replace("images_", "")) || 0
              totalImages += imageCount
            }
          } else {
            console.log("Invalid payment info result:", paymentInfo)
          }
        } catch (err) {
          console.error(`Failed to get payment info for ${paymentId}:`, err)
        }
      }

      // Calculate available credits from localStorage tracking
      // Since we can't track image usage on-chain, we use localStorage as backup
      const usedImages = parseInt(localStorage.getItem(`used_images_${address}`) || "0")
      availableCredits = Math.max(0, totalImages - usedImages)

      setStats({
        totalPaid: formatUnits(totalPaid, 18),
        totalImages,
        availableCredits,
        paymentHistory: payments.sort((a, b) => b.timestamp - a.timestamp)
      })
    } catch (err) {
      console.error("Failed to fetch payment stats:", err)
      setError("Failed to fetch payment data")
      setStats({
        totalPaid: "0",
        totalImages: 0,
        availableCredits: 0,
        paymentHistory: []
      })
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  const createPayment = useCallback(
    async (imageCount: number, description: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      if (!merchantInfo || !merchantInfo.active) {
        setError("You must be a registered merchant to create payments")
        return null
      }

      // Ensure correct chain
      const chainSwitched = await ensureCorrectChain()
      if (!chainSwitched) {
        setError("Please switch to Sepolia network")
        return null
      }

      setError(null)
      const totalAmount = imageCount * PRICE_PER_IMAGE
      const amountWei = parseUnits(totalAmount.toString(), 18)

      try {
        // First approve THY tokens to Payment Gateway
        const thyTokenAbi = [
          "function approve(address spender, uint256 amount) returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)"
        ]

        // Check current allowance
        const allowanceResult = await publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: thyTokenAbi,
          functionName: "allowance",
          args: [address as `0x${string}`, CONTRACTS.THY_PAYMENT_GATEWAY],
        })
        
        const currentAllowance = typeof allowanceResult === 'bigint' ? allowanceResult : BigInt(0)

        // Approve if needed  
        if (currentAllowance < amountWei) {
          console.log(`Approving ${formatUnits(amountWei, 18)} THY to Payment Gateway`)
          const approveHash = await walletClient.writeContract({
            address: CONTRACTS.THY_TOKEN,
            abi: thyTokenAbi,
            functionName: "approve",
            args: [CONTRACTS.THY_PAYMENT_GATEWAY, amountWei],
            account: address as `0x${string}`,
            chain: sepolia,
          })

          await publicClient.waitForTransactionReceipt({ hash: approveHash })
          console.log("Approval confirmed")
        }

        // Create payment on contract
        const orderId = `images_${imageCount}`
        const createPaymentHash = await walletClient.writeContract({
          address: CONTRACTS.THY_PAYMENT_GATEWAY,
          abi: PAYMENT_GATEWAY_ABI,
          functionName: "createPayment",
          args: [
            address as `0x${string}`, // payer
            amountWei, // amount
            orderId, // orderId
            description // metadata
          ],
          account: address as `0x${string}`,
          chain: sepolia,
        })

        await publicClient.waitForTransactionReceipt({ hash: createPaymentHash })

        // Refresh stats after successful payment creation
        await fetchPaymentStats()

        return createPaymentHash
      } catch (err) {
        console.error("Payment creation failed:", err)
        setError("Payment creation failed")
        return null
      }
    },
    [walletClient, address, ensureCorrectChain, merchantInfo, fetchPaymentStats]
  )

  const processPayment = useCallback(
    async (paymentId: string): Promise<Hash | null> => {
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

      setError(null)

      try {
        const processHash = await walletClient.writeContract({
          address: CONTRACTS.THY_PAYMENT_GATEWAY,
          abi: PAYMENT_GATEWAY_ABI,
          functionName: "processPayment",
          args: [paymentId as `0x${string}`],
          account: address as `0x${string}`,
          chain: sepolia,
        })

        await publicClient.waitForTransactionReceipt({ hash: processHash })

        // Refresh stats after successful payment processing
        await fetchPaymentStats()

        return processHash
      } catch (err) {
        console.error("Payment processing failed:", err)
        setError("Payment processing failed")
        return null
      }
    },
    [walletClient, address, ensureCorrectChain, fetchPaymentStats]
  )

  const useCredits = useCallback(
    async (imageCount: number): Promise<boolean> => {
      if (!address || !stats) return false

      if (stats.availableCredits < imageCount) {
        setError("Insufficient credits")
        return false
      }

      try {
        // Update used images count in localStorage
        const currentUsed = parseInt(localStorage.getItem(`used_images_${address}`) || "0")
        localStorage.setItem(`used_images_${address}`, (currentUsed + imageCount).toString())
        
        // Update stats
        setStats(prev => prev ? {
          ...prev,
          availableCredits: prev.availableCredits - imageCount
        } : null)
        
        return true
      } catch (err) {
        console.error("Failed to use credits:", err)
        setError("Failed to use credits")
        return false
      }
    },
    [address, stats]
  )

  const getTotalStats = useCallback(() => {
    if (!stats) return {
      totalPaid: "0",
      totalImages: 0,
      availableCredits: 0,
      remainingCredits: 0,
      remainingValue: "0"
    }

    const remainingValue = (stats.availableCredits * PRICE_PER_IMAGE).toString()
    
    return {
      totalPaid: stats.totalPaid,
      totalImages: stats.totalImages,
      availableCredits: stats.availableCredits,
      remainingCredits: stats.availableCredits, // Alias for compatibility
      remainingValue
    }
  }, [stats])

  const getPaymentHistory = useCallback(() => {
    return stats?.paymentHistory || []
  }, [stats])

  useEffect(() => {
    if (isConnected && address) {
      checkMerchantStatus()
      fetchPaymentStats()
    }
  }, [isConnected, address, checkMerchantStatus, fetchPaymentStats])

  return {
    merchantInfo,
    paymentData: stats,
    isLoading,
    error,
    PRICE_PER_IMAGE,
    createPayment,
    processPayment,
    useCredits,
    getPaymentHistory,
    getTotalStats,
    refetch: fetchPaymentStats,
  }
}