"use client"

import { useCallback } from "react"
import { useWallet } from "./use-wallet"

export function useChainCheck() {
  const { chainId } = useWallet()

  const ensureCorrectChain = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.ethereum) {
      return false
    }

    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    })
    const chainIdNumber = Number.parseInt(currentChainId, 16)

    if (chainIdNumber !== 11155111) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
        })
        return true
      } catch (switchError: any) {
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
            return true
          } catch (addError) {
            console.error("Failed to add Sepolia network:", addError)
            return false
          }
        } else {
          console.error("Failed to switch to Sepolia:", switchError)
          return false
        }
      }
    }

    return true
  }, [])

  return {
    isCorrectChain: chainId === 11155111,
    ensureCorrectChain,
  }
}