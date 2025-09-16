"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

interface WalletAddressPickerProps {
  onSelectAddress: (address: string) => void
  className?: string
  buttonText?: string
}

export function WalletAddressPicker({ 
  onSelectAddress, 
  className = "",
  buttonText = "Use My Wallet"
}: WalletAddressPickerProps) {
  const { address, isConnected } = useWallet()

  const handleClick = () => {
    if (address) {
      onSelectAddress(address)
    }
  }

  if (!isConnected || !address) {
    return null
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={`gap-2 ${className}`}
    >
      <Wallet className="h-3 w-3" />
      {buttonText}
    </Button>
  )
}