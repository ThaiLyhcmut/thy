"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"

interface AnalyticsData {
  totalValueLocked: string
  totalStakers: number
  totalRewardsDistributed: string
  averageAPY: string
  thyPrice: string
  priceChange24h: string
  marketCap: string
  circulatingSupply: string
  totalSupply: string
  stakingRatio: string
}

interface ChartData {
  date: string
  tvl: number
  price: number
  stakers: number
  rewards: number
}

interface PoolAnalytics {
  poolId: number
  name: string
  tvl: string
  stakers: number
  apy: string
  utilization: number
}

interface UserAnalytics {
  totalStaked: string
  totalRewards: string
  activeStakes: number
  averageAPY: string
  portfolioValue: string
  loyaltyTier: string
}

export function useAnalytics() {
  const { address, isConnected } = useWallet()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [poolAnalytics, setPoolAnalytics] = useState<PoolAnalytics[]>([])
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock analytics data
      const mockAnalytics: AnalyticsData = {
        totalValueLocked: "2,450,000",
        totalStakers: 1234,
        totalRewardsDistributed: "125,000",
        averageAPY: "24.5",
        thyPrice: "0.85",
        priceChange24h: "+5.3",
        marketCap: "8,500,000",
        circulatingSupply: "10,000,000",
        totalSupply: "100,000,000",
        stakingRatio: "24.5",
      }

      setAnalyticsData(mockAnalytics)

      // Mock chart data for the last 30 days
      const mockChartData: ChartData[] = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        mockChartData.push({
          date: date.toISOString().split("T")[0],
          tvl: 2000000 + Math.random() * 500000,
          price: 0.7 + Math.random() * 0.3,
          stakers: 1000 + Math.floor(Math.random() * 500),
          rewards: 100000 + Math.random() * 50000,
        })
      }
      setChartData(mockChartData)

      // Mock pool analytics
      const mockPoolAnalytics: PoolAnalytics[] = [
        {
          poolId: 0,
          name: "30-Day Pool",
          tvl: "450,000",
          stakers: 234,
          apy: "10%",
          utilization: 75,
        },
        {
          poolId: 1,
          name: "90-Day Pool",
          tvl: "680,000",
          stakers: 345,
          apy: "20%",
          utilization: 85,
        },
        {
          poolId: 2,
          name: "180-Day Pool",
          tvl: "820,000",
          stakers: 456,
          apy: "35%",
          utilization: 92,
        },
        {
          poolId: 3,
          name: "365-Day Pool",
          tvl: "500,000",
          stakers: 199,
          apy: "50%",
          utilization: 68,
        },
      ]
      setPoolAnalytics(mockPoolAnalytics)
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      setError("Failed to fetch analytics data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUserAnalytics = useCallback(async () => {
    if (!address) return

    try {
      // Mock user analytics
      const mockUserAnalytics: UserAnalytics = {
        totalStaked: "7,500",
        totalRewards: "892.34",
        activeStakes: 2,
        averageAPY: "28.5",
        portfolioValue: "8,392.34",
        loyaltyTier: "Gold",
      }

      setUserAnalytics(mockUserAnalytics)
    } catch (err) {
      console.error("Failed to fetch user analytics:", err)
    }
  }, [address])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  useEffect(() => {
    if (isConnected && address) {
      fetchUserAnalytics()
    } else {
      setUserAnalytics(null)
    }
  }, [isConnected, address, fetchUserAnalytics])

  return {
    analyticsData,
    chartData,
    poolAnalytics,
    userAnalytics,
    isLoading,
    error,
    refetch: () => {
      fetchAnalyticsData()
      fetchUserAnalytics()
    },
  }
}
