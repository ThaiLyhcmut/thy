"use client"

import { useState, useEffect, useCallback } from "react"
import { createWalletClientFromWindow } from "@/lib/web3"
import type { WalletClient } from "viem"

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
  })

  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    setState((prev) => ({ ...prev, isConnecting: true }))

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const client = createWalletClientFromWindow()
        if (client) {
          setWalletClient(client)

          // Get chain ID
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          })

          setState({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            chainId: Number.parseInt(chainId, 16),
          })
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setState((prev) => ({ ...prev, isConnecting: false }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
    })
    setWalletClient(null)
  }, [])

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })

          if (accounts.length > 0) {
            const client = createWalletClientFromWindow()
            if (client) {
              setWalletClient(client)

              const chainId = await window.ethereum.request({
                method: "eth_chainId",
              })

              setState({
                address: accounts[0],
                isConnected: true,
                isConnecting: false,
                chainId: Number.parseInt(chainId, 16),
              })
            }
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setState((prev) => ({ ...prev, address: accounts[0] }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        setState((prev) => ({ ...prev, chainId: Number.parseInt(chainId, 16) }))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum?.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [disconnect])

  return {
    ...state,
    walletClient,
    connect,
    disconnect,
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
