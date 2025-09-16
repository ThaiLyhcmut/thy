"use client"

import { useChainCheck } from "@/hooks/use-chain-check"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"

export function ChainWarning() {
  const { isCorrectChain, ensureCorrectChain } = useChainCheck()
  const [isSwitching, setIsSwitching] = useState(false)

  if (isCorrectChain) return null

  const handleSwitchChain = async () => {
    setIsSwitching(true)
    await ensureCorrectChain()
    setIsSwitching(false)
  }

  return (
    <Alert className="border-yellow-500/20 bg-yellow-500/5 mb-6">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-yellow-700">
          Wrong network detected. Please switch to Sepolia testnet to use the application.
        </span>
        <Button
          onClick={handleSwitchChain}
          disabled={isSwitching}
          variant="outline"
          size="sm"
          className="ml-4 border-yellow-500/20 hover:border-yellow-500/40"
        >
          {isSwitching ? "Switching..." : "Switch to Sepolia"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}