"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { publicClient, CONTRACTS, THY_TOKEN_ABI, formatTokenAmount, parseTokenAmount } from "@/lib/web3"
import type { Hash } from "viem"

interface TokenData {
  balance: string
  totalSupply: string
  name: string
  symbol: string
  decimals: number
  isPaused: boolean
}

export function useThyToken() {
  const { address, walletClient, isConnected } = useWallet()
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTokenData = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const [balance, totalSupply, name, symbol, decimals, isPaused] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "totalSupply",
        }),
        publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "name",
        }),
        publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "symbol",
        }),
        publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "decimals",
        }),
        publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "paused",
        }),
      ])

      setTokenData({
        balance: formatTokenAmount(balance as bigint),
        totalSupply: formatTokenAmount(totalSupply as bigint),
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        isPaused: isPaused as boolean,
      })
    } catch (err) {
      console.error("Failed to fetch token data:", err)
      setError("Failed to fetch token data")
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const transfer = useCallback(
    async (to: string, amount: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const parsedAmount = parseTokenAmount(amount)

        const hash = await walletClient.writeContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "transfer",
          args: [to as `0x${string}`, parsedAmount],
          account: address as `0x${string}`,
        })

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash })

        // Refresh token data
        await fetchTokenData()

        return hash
      } catch (err) {
        console.error("Transfer failed:", err)
        setError("Transfer failed")
        return null
      }
    },
    [walletClient, address, fetchTokenData],
  )

  const approve = useCallback(
    async (spender: string, amount: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const parsedAmount = parseTokenAmount(amount)

        const hash = await walletClient.writeContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "approve",
          args: [spender as `0x${string}`, parsedAmount],
          account: address as `0x${string}`,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        return hash
      } catch (err) {
        console.error("Approval failed:", err)
        setError("Approval failed")
        return null
      }
    },
    [walletClient, address],
  )

  const mint = useCallback(
    async (to: string, amount: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const parsedAmount = parseTokenAmount(amount)

        const hash = await walletClient.writeContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "mint",
          args: [to as `0x${string}`, parsedAmount],
          account: address as `0x${string}`,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        await fetchTokenData()
        return hash
      } catch (err) {
        console.error("Mint failed:", err)
        setError("Mint failed")
        return null
      }
    },
    [walletClient, address, fetchTokenData],
  )

  const burn = useCallback(
    async (amount: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      setError(null)

      try {
        const parsedAmount = parseTokenAmount(amount)

        const hash = await walletClient.writeContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "burn",
          args: [parsedAmount],
          account: address as `0x${string}`,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        await fetchTokenData()
        return hash
      } catch (err) {
        console.error("Burn failed:", err)
        setError("Burn failed")
        return null
      }
    },
    [walletClient, address, fetchTokenData],
  )

  useEffect(() => {
    if (isConnected && address) {
      fetchTokenData()
    }
  }, [isConnected, address, fetchTokenData])

  return {
    tokenData,
    isLoading,
    error,
    transfer,
    approve,
    mint,
    burn,
    refetch: fetchTokenData,
  }
}
