"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./use-wallet"
import { useChainCheck } from "./use-chain-check"
import { publicClient, CONTRACTS, THY_TOKEN_ABI, formatTokenAmount, parseTokenAmount } from "@/lib/web3"
import type { Hash } from "viem"
import { sepolia } from "viem/chains"

interface TokenData {
  balance: string
  totalSupply: string
  name: string
  symbol: string
  decimals: number
  isPaused: boolean
  owner: string
  isOwner: boolean
}

export function useThyToken() {
  const { address, walletClient, isConnected } = useWallet()
  const { ensureCorrectChain } = useChainCheck()
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTokenData = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const [balance, totalSupply, name, symbol, decimals, isPaused, owner] = await Promise.all([
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
        publicClient.readContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "owner",
        }),
      ])

      setTokenData({
        balance: formatTokenAmount(balance as bigint),
        totalSupply: formatTokenAmount(totalSupply as bigint),
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        isPaused: isPaused as boolean,
        owner: owner as string,
        isOwner: address.toLowerCase() === (owner as string).toLowerCase(),
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

      // Ensure we're on the correct chain before transaction
      const chainSwitched = await ensureCorrectChain()
      if (!chainSwitched) {
        setError("Please switch to Sepolia network")
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
          chain: sepolia,
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
    [walletClient, address, fetchTokenData, ensureCorrectChain],
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
          chain: sepolia,
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

      // Ensure we're on the correct chain before transaction
      const chainSwitched = await ensureCorrectChain()
      if (!chainSwitched) {
        setError("Please switch to Sepolia network")
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
          chain: sepolia,
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
    [walletClient, address, fetchTokenData, ensureCorrectChain],
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
          chain: sepolia,
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

  const pause = useCallback(async (): Promise<Hash | null> => {
    if (!walletClient || !address) {
      setError("Wallet not connected")
      return null
    }

    // Ensure we're on the correct chain before transaction
    const chainSwitched = await ensureCorrectChain()
    if (!chainSwitched) {
      setError("Please switch to Sepolia network")
      return null
    }

    setError(null)

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_TOKEN,
        abi: THY_TOKEN_ABI,
        functionName: "pause",
        args: [],
        account: address as `0x${string}`,
        chain: sepolia,
      })

      await publicClient.waitForTransactionReceipt({ hash })
      await fetchTokenData()
      return hash
    } catch (err) {
      console.error("Pause failed:", err)
      setError("Pause failed")
      return null
    }
  }, [walletClient, address, fetchTokenData, ensureCorrectChain])

  const unpause = useCallback(async (): Promise<Hash | null> => {
    if (!walletClient || !address) {
      setError("Wallet not connected")
      return null
    }

    // Ensure we're on the correct chain before transaction
    const chainSwitched = await ensureCorrectChain()
    if (!chainSwitched) {
      setError("Please switch to Sepolia network")
      return null
    }

    setError(null)

    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_TOKEN,
        abi: THY_TOKEN_ABI,
        functionName: "unpause",
        args: [],
        account: address as `0x${string}`,
        chain: sepolia,
      })

      await publicClient.waitForTransactionReceipt({ hash })
      await fetchTokenData()
      return hash
    } catch (err) {
      console.error("Unpause failed:", err)
      setError("Unpause failed")
      return null
    }
  }, [walletClient, address, fetchTokenData, ensureCorrectChain])

  const transferOwnership = useCallback(
    async (newOwner: string): Promise<Hash | null> => {
      if (!walletClient || !address) {
        setError("Wallet not connected")
        return null
      }

      // Ensure we're on the correct chain before transaction
      const chainSwitched = await ensureCorrectChain()
      if (!chainSwitched) {
        setError("Please switch to Sepolia network")
        return null
      }

      setError(null)

      try {
        const hash = await walletClient.writeContract({
          address: CONTRACTS.THY_TOKEN,
          abi: THY_TOKEN_ABI,
          functionName: "transferOwnership",
          args: [newOwner as `0x${string}`],
          account: address as `0x${string}`,
          chain: sepolia,
        })

        await publicClient.waitForTransactionReceipt({ hash })
        await fetchTokenData()
        return hash
      } catch (err) {
        console.error("Transfer ownership failed:", err)
        setError("Transfer ownership failed")
        return null
      }
    },
    [walletClient, address, fetchTokenData, ensureCorrectChain],
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
    pause,
    unpause,
    transferOwnership,
    refetch: fetchTokenData,
  }
}
