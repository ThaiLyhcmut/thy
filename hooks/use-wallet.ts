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
        // Get current chain ID
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        const currentChainId = Number.parseInt(chainId, 16)

        // Switch to Sepolia if not already on it
        if (currentChainId !== 11155111) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
            })
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0xaa36a7",
                      chainName: "Sepolia",
                      nativeCurrency: {
                        name: "Sepolia ETH",
                        symbol: "SEP",
                        decimals: 18,
                      },
                      rpcUrls: ["https://sepolia.infura.io/v3/"],
                      blockExplorerUrls: ["https://sepolia.etherscan.io/"],
                    },
                  ],
                })
              } catch (addError) {
                console.error("Failed to add Sepolia network:", addError)
                setState((prev) => ({ ...prev, isConnecting: false }))
                return
              }
            } else {
              console.error("Failed to switch to Sepolia:", switchError)
              setState((prev) => ({ ...prev, isConnecting: false }))
              return
            }
          }
        }

        const client = createWalletClientFromWindow()
        if (client) {
          setWalletClient(client)

          setState({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            chainId: 11155111,
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

      const handleChainChanged = async (chainId: string) => {
        const newChainId = Number.parseInt(chainId, 16)
        setState((prev) => ({ ...prev, chainId: newChainId }))
        
        // Auto switch back to Sepolia if user changes to another chain
        if (newChainId !== 11155111 && state.isConnected) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xaa36a7" }],
            })
          } catch (error) {
            console.error("Failed to switch back to Sepolia:", error)
          }
        }
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
