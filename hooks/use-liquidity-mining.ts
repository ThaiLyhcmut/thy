"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { publicClient, CONTRACTS, LIQUIDITY_MINING_ABI, formatTokenAmount, parseTokenAmount } from "@/lib/web3"
import type { Hash } from "viem"

interface PoolStats {
  totalStaked: string
  totalRewardsDistributed: string
  totalUsers: string
  totalFeesCollected: string
  currentAPR: string
}

interface UserStats {
  stakedAmount: string
  pendingRewards: string
  totalClaimed: string
  tierMultiplier: string
  tierName: string
  stakingDuration: string
}

interface UserTier {
  tierIndex: number
  multiplier: string
  tierName: string
}

interface LoyaltyTier {
  name: string
  multiplier: string
  color: string
  minDays: number
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { name: "Bronze", multiplier: "1.0x", color: "bg-amber-600", minDays: 0 },
  { name: "Silver", multiplier: "1.2x", color: "bg-gray-400", minDays: 7 },
  { name: "Gold", multiplier: "1.5x", color: "bg-yellow-500", minDays: 30 },
  { name: "Platinum", multiplier: "2.0x", color: "bg-blue-500", minDays: 90 },
]

export function useLiquidityMining() {
  const { address, walletClient, isConnected } = useWallet()
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userTier, setUserTier] = useState<UserTier | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPoolStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const stats = (await publicClient.readContract({
        address: CONTRACTS.LIQUIDITY_MINING,
        abi: LIQUIDITY_MINING_ABI,
        functionName: "getPoolStats",
      })) as [bigint, bigint, bigint, bigint, bigint]

      const [totalStaked, totalRewardsDistributed, totalUsers, totalFeesCollected, currentAPR] = stats

      setPoolStats({
        totalStaked: formatTokenAmount(totalStaked),
        totalRewardsDistributed: formatTokenAmount(totalRewardsDistributed),
        totalUsers: totalUsers.toString(),
        totalFeesCollected: formatTokenAmount(totalFeesCollected),
        currentAPR: currentAPR.toString(),
      })
    } catch (err) {
      console.error("Failed to fetch pool stats:", err)
      setError("Failed to fetch pool stats")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUserStats = useCallback(async () => {
    if (!address) return

    try {
      const [stats, tier] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.LIQUIDITY_MINING,
          abi: LIQUIDITY_MINING_ABI,
          functionName: "getUserStats",
          args: [address as `0x${string}`],
        }) as [bigint, bigint, bigint, bigint, string, bigint],
        publicClient.readContract({
          address: CONTRACTS.LIQUIDITY_MINING,
          abi: LIQUIDITY_MINING_ABI,
          functionName: "getUserTier",
          args: [address as `0x${string}`],
        }) as [bigint, bigint, string],
      ])

      const [stakedAmount, pendingRewards, totalClaimed, tierMultiplier, tierName, stakingDuration] = stats
      const [tierIndex, multiplier, tierNameFromContract] = tier

      setUserStats({
        stakedAmount: formatTokenAmount(stakedAmount),
        pendingRewards: formatTokenAmount(pendingRewards),
        totalClaimed: formatTokenAmount(totalClaimed),
        tierMultiplier: (Number(tierMultiplier) / 1000).toFixed(1) + "x",
        tierName,
        stakingDuration: (Number(stakingDuration) / 86400).toFixed(0), // Convert seconds to days
      })

      setUserTier({
        tierIndex: Number(tierIndex),
        multiplier: (Number(multiplier) / 1000).toFixed(1) + "x",
        tierName: tierNameFromContract,
      })
    } catch (err) {
      console.error("Failed to fetch user stats:", err)
    }
  }, [address])

  const deposit = useCallback(
    async (amount: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const parsedAmount = parseTokenAmount(amount)

        const hash = await walletClient.writeContract({
          address: CONTRACTS.LIQUIDITY_MINING,
          abi: LIQUIDITY_MINING_ABI,
          functionName: "deposit",
          args: [parsedAmount],
          account: address as `0x${string}`,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        await Promise.all([fetchPoolStats(), fetchUserStats()])
        return hash
      } catch (err) {
        console.error("Deposit failed:", err)
        setError("Deposit failed")
        return null
      }
    },
    [walletClient, address, fetchPoolStats, fetchUserStats],
  )

  const withdraw = useCallback(
    async (amount: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const parsedAmount = parseTokenAmount(amount)

        const hash = await walletClient.writeContract({
          address: CONTRACTS.LIQUIDITY_MINING,
          abi: LIQUIDITY_MINING_ABI,
          functionName: "withdraw",
          args: [parsedAmount],
          account: address as `0x${string}`,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        await Promise.all([fetchPoolStats(), fetchUserStats()])
        return hash
      } catch (err) {
        console.error("Withdraw failed:", err)
        setError("Withdraw failed")
        return null
      }
    },
    [walletClient, address, fetchPoolStats, fetchUserStats],
  )

  const claimRewards = useCallback(async (): Promise<Hash | null> => {
    if (!walletClient || !address) {
      setError("Wallet not connected")
      return null
    }

    setError(null)

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.LIQUIDITY_MINING,
        abi: LIQUIDITY_MINING_ABI,
        functionName: "claimRewards",
        account: address as `0x${string}`,
      })

      await publicClient.waitForTransactionReceipt({ hash })
      await Promise.all([fetchPoolStats(), fetchUserStats()])
      return hash
    } catch (err) {
      console.error("Claim rewards failed:", err)
      setError("Claim rewards failed")
      return null
    }
  }, [walletClient, address, fetchPoolStats, fetchUserStats])

  const emergencyWithdraw = useCallback(async (): Promise<Hash | null> => {
    if (!walletClient || !address) {
      setError("Wallet not connected")
      return null
    }

    setError(null)

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.LIQUIDITY_MINING,
        abi: LIQUIDITY_MINING_ABI,
        functionName: "emergencyWithdraw",
        account: address as `0x${string}`,
      })

      await publicClient.waitForTransactionReceipt({ hash })
      await Promise.all([fetchPoolStats(), fetchUserStats()])
      return hash
    } catch (err) {
      console.error("Emergency withdraw failed:", err)
      setError("Emergency withdraw failed")
      return null
    }
  }, [walletClient, address, fetchPoolStats, fetchUserStats])

  useEffect(() => {
    fetchPoolStats()
  }, [fetchPoolStats])

  useEffect(() => {
    if (isConnected && address) {
      fetchUserStats()
    }
  }, [isConnected, address, fetchUserStats])

  return {
    poolStats,
    userStats,
    userTier,
    isLoading,
    error,
    deposit,
    withdraw,
    claimRewards,
    emergencyWithdraw,
    refetch: () => Promise.all([fetchPoolStats(), fetchUserStats()]),
  }
}
