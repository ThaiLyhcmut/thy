"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { publicClient, CONTRACTS, STAKING_ABI, formatTokenAmount, parseTokenAmount } from "@/lib/web3"
import type { Hash } from "viem"
import { sepolia } from "viem/chains"

interface StakePool {
  id: number
  lockPeriod: number
  rewardRate: number
  minStakeAmount: string
  active: boolean
  apy: string
  name: string
}

interface UserStake {
  id: number
  amount: string
  lockPeriod: number
  endTime: number
  rewardRate: number
  accumulatedRewards: string
  autoCompound: boolean
  withdrawn: boolean
  pendingRewards: string
  canWithdraw: boolean
  daysRemaining: number
}

export function useStaking() {
  const { address, walletClient, isConnected } = useWallet()
  const [pools, setPools] = useState<StakePool[]>([])
  const [userStakes, setUserStakes] = useState<UserStake[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPools = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const activePoolIds = (await publicClient.readContract({
        address: CONTRACTS.STAKING_CONTRACT,
        abi: STAKING_ABI,
        functionName: "getActivePools",
      })) as bigint[]

      const poolPromises = activePoolIds.map((poolId) =>
        publicClient.readContract({
          address: CONTRACTS.STAKING_CONTRACT,
          abi: STAKING_ABI,
          functionName: "getPoolInfo",
          args: [poolId],
        }),
      )

      const poolsData = await Promise.all(poolPromises)

      const formattedPools: StakePool[] = poolsData.map((poolData: any, index) => {
        const [lockPeriod, rewardRate, totalStaked, minStakeAmount, active] = poolData

        const lockPeriodNum = Number(lockPeriod.toString())
        const rewardRateNum = Number(rewardRate.toString())
        const apy = (rewardRateNum / 100).toFixed(0) + "%"

        return {
          id: Number(activePoolIds[index].toString()),
          lockPeriod: lockPeriodNum,
          rewardRate: rewardRateNum,
          minStakeAmount: formatTokenAmount(minStakeAmount),
          active,
          apy,
          name: `${lockPeriodNum}-Day Pool`,
        }
      })

      setPools(formattedPools)
    } catch (err) {
      console.error("Failed to fetch pools:", err)
      setError("Failed to fetch staking pools")

      const mockPools: StakePool[] = [
        {
          id: 0,
          lockPeriod: 30,
          rewardRate: 1000,
          minStakeAmount: "100",
          active: true,
          apy: "10%",
          name: "30-Day Pool",
        },
        {
          id: 1,
          lockPeriod: 90,
          rewardRate: 2000,
          minStakeAmount: "100",
          active: true,
          apy: "20%",
          name: "90-Day Pool",
        },
        {
          id: 2,
          lockPeriod: 180,
          rewardRate: 3500,
          minStakeAmount: "100",
          active: true,
          apy: "35%",
          name: "180-Day Pool",
        },
        {
          id: 3,
          lockPeriod: 365,
          rewardRate: 5000,
          minStakeAmount: "100",
          active: true,
          apy: "50%",
          name: "365-Day Pool",
        },
      ]
      setPools(mockPools)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUserStakes = useCallback(async () => {
    if (!address) return

    try {
      const stakeCount = (await publicClient.readContract({
        address: CONTRACTS.STAKING_CONTRACT,
        abi: STAKING_ABI,
        functionName: "getUserStakeCount",
        args: [address as `0x${string}`],
      })) as bigint

      const stakePromises = []
      for (let i = 0; i < Number(stakeCount.toString()); i++) {
        stakePromises.push(
          publicClient.readContract({
            address: CONTRACTS.STAKING_CONTRACT,
            abi: STAKING_ABI,
            functionName: "getStakeInfo",
            args: [address as `0x${string}`, BigInt(i)],
          }),
        )
      }

      const stakesData = await Promise.all(stakePromises)

      const formattedStakes: UserStake[] = stakesData.map((stakeData: any, index) => {
        const [amount, startTime, lockPeriod, rewardRate, pendingReward, totalReward, withdrawn, canWithdraw] =
          stakeData

        const startTimeMs = Number(startTime.toString()) * 1000
        const lockPeriodMs = Number(lockPeriod.toString()) * 24 * 60 * 60 * 1000 // Convert days to milliseconds
        const endTime = startTimeMs + lockPeriodMs
        const now = Date.now()
        const daysRemaining = Math.max(0, Math.ceil((endTime - now) / (24 * 60 * 60 * 1000)))

        return {
          id: index,
          amount: formatTokenAmount(amount),
          lockPeriod: Number(lockPeriod.toString()),
          endTime,
          rewardRate: Number(rewardRate.toString()),
          accumulatedRewards: formatTokenAmount(totalReward),
          autoCompound: false, // Not available in current ABI
          withdrawn,
          pendingRewards: formatTokenAmount(pendingReward),
          canWithdraw,
          daysRemaining,
        }
      })

      setUserStakes(formattedStakes)
    } catch (err) {
      console.error("Failed to fetch user stakes:", err)

      const mockStakes: UserStake[] = [
        {
          id: 0,
          amount: "5000",
          lockPeriod: 90,
          endTime: Date.now() + 45 * 24 * 60 * 60 * 1000,
          rewardRate: 2000,
          accumulatedRewards: "123.45",
          autoCompound: true,
          withdrawn: false,
          pendingRewards: "67.89",
          canWithdraw: false,
          daysRemaining: 45,
        },
        {
          id: 1,
          amount: "2000",
          lockPeriod: 30,
          endTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
          rewardRate: 1000,
          accumulatedRewards: "16.44",
          autoCompound: false,
          withdrawn: false,
          pendingRewards: "16.44",
          canWithdraw: true,
          daysRemaining: 0,
        },
      ]
      setUserStakes(mockStakes)
    }
  }, [address])

  const stake = useCallback(
    async (poolId: number, amount: string, autoCompound: boolean): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const pool = pools.find((p) => p.id === poolId)
        if (!pool) {
          setError("Pool not found")
          return null
        }

        const hash = await walletClient.writeContract({
          address: CONTRACTS.STAKING_CONTRACT,
          abi: STAKING_ABI,
          functionName: "stake",
          args: [parseTokenAmount(amount), BigInt(pool.lockPeriod), autoCompound],
          account: address as `0x${string}`,
          chain: sepolia,
        })

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash })

        // Refresh user stakes
        await fetchUserStakes()

        return hash
      } catch (err) {
        console.error("Stake failed:", err)
        setError("Stake transaction failed")
        return null
      }
    },
    [walletClient, address, fetchUserStakes, pools],
  )

  const withdraw = useCallback(
    async (stakeId: number): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        console.log("[v0] Starting withdraw for stake ID:", stakeId)

        const hash = await walletClient.writeContract({
          address: CONTRACTS.STAKING_CONTRACT,
          abi: STAKING_ABI,
          functionName: "withdraw",
          args: [BigInt(stakeId)],
          account: address as `0x${string}`,
          chain: sepolia,
        })

        console.log("[v0] Withdraw transaction hash:", hash)

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log("[v0] Withdraw transaction confirmed:", receipt.status)

        setUserStakes((prevStakes) =>
          prevStakes.map((stake) => (stake.id === stakeId ? { ...stake, withdrawn: true, canWithdraw: false } : stake)),
        )

        console.log("[v0] User stakes updated after withdraw")

        return hash
      } catch (err) {
        console.error("Withdraw failed:", err)
        setError("Withdraw transaction failed")
        return null
      }
    },
    [walletClient, address],
  )

  const emergencyWithdraw = useCallback(
    async (stakeId: number): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const hash = await walletClient.writeContract({
          address: CONTRACTS.STAKING_CONTRACT,
          abi: STAKING_ABI,
          functionName: "emergencyWithdraw",
          args: [BigInt(stakeId)],
          account: address as `0x${string}`,
          chain: sepolia,
        })

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash })

        await fetchUserStakes()
        return hash
      } catch (err) {
        console.error("Emergency withdraw failed:", err)
        setError("Emergency withdraw failed")
        return null
      }
    },
    [walletClient, address, fetchUserStakes],
  )

  const compoundRewards = useCallback(
    async (stakeId: number): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const hash = await walletClient.writeContract({
          address: CONTRACTS.STAKING_CONTRACT,
          abi: STAKING_ABI,
          functionName: "compoundRewards",
          args: [BigInt(stakeId)],
          account: address as `0x${string}`,
          chain: sepolia,
        })

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash })

        await fetchUserStakes()
        return hash
      } catch (err) {
        console.error("Compound failed:", err)
        setError("Compound transaction failed")
        return null
      }
    },
    [walletClient, address, fetchUserStakes],
  )

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  useEffect(() => {
    if (isConnected && address) {
      fetchUserStakes()
    }
  }, [isConnected, address, fetchUserStakes])

  return {
    pools,
    userStakes,
    isLoading,
    error,
    stake,
    withdraw,
    emergencyWithdraw,
    compoundRewards,
    refetch: () => {
      fetchPools()
      fetchUserStakes()
    },
  }
}
