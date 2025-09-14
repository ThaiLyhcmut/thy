"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Wallet, LogOut } from "lucide-react"

export function WalletConnect() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">{formatAddress(address)}</div>
        <Button variant="outline" size="sm" onClick={disconnect} className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={connect} disabled={isConnecting} className="gap-2">
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
