"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useThyToken } from "@/hooks/use-thy-token"
import { useWallet } from "@/hooks/use-wallet"
import { Shield, Lock, Unlock, UserCheck, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WalletAddressPicker } from "@/components/wallet-address-picker"

export function AdminPanel() {
  const { address } = useWallet()
  const { tokenData, pause, unpause, transferOwnership } = useThyToken()
  const { toast } = useToast()
  const [newOwner, setNewOwner] = useState("")
  const [isTransacting, setIsTransacting] = useState(false)

  if (!tokenData?.isOwner) {
    return null
  }

  const handlePause = async () => {
    setIsTransacting(true)
    const hash = await pause()
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Contract Paused",
        description: "The token contract has been paused successfully",
      })
    }
  }

  const handleUnpause = async () => {
    setIsTransacting(true)
    const hash = await unpause()
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Contract Unpaused",
        description: "The token contract has been unpaused successfully",
      })
    }
  }

  const handleTransferOwnership = async () => {
    if (!newOwner) return

    setIsTransacting(true)
    const hash = await transferOwnership(newOwner)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Ownership Transferred",
        description: `Ownership has been transferred to ${newOwner}`,
      })
      setNewOwner("")
    }
  }

  return (
    <Card className="bg-card border-border border-2 border-yellow-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-card-foreground">Admin Panel</CardTitle>
          </div>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Owner Access
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          Contract owner privileges - Use with caution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Status */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-card-foreground">Contract Status</span>
            <Badge variant={tokenData.isPaused ? "destructive" : "default"}>
              {tokenData.isPaused ? "Paused" : "Active"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Owner</span>
            <span className="text-xs font-mono text-card-foreground">
              {tokenData.owner.slice(0, 6)}...{tokenData.owner.slice(-4)}
            </span>
          </div>
        </div>

        {/* Pause/Unpause Controls */}
        <div className="space-y-3">
          <Label className="text-card-foreground">Contract Controls</Label>
          <div className="flex gap-2">
            <Button
              onClick={handlePause}
              disabled={tokenData.isPaused || isTransacting}
              variant="destructive"
              className="flex-1 gap-2"
            >
              <Lock className="h-4 w-4" />
              Pause Contract
            </Button>
            <Button
              onClick={handleUnpause}
              disabled={!tokenData.isPaused || isTransacting}
              variant="default"
              className="flex-1 gap-2"
            >
              <Unlock className="h-4 w-4" />
              Unpause Contract
            </Button>
          </div>
        </div>

        {/* Transfer Ownership */}
        <div className="space-y-3">
          <Label className="text-card-foreground">Transfer Ownership</Label>
          <Alert className="border-yellow-500/20 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              This action is irreversible. You will lose all owner privileges.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-owner" className="text-card-foreground">
                New Owner Address
              </Label>
              <WalletAddressPicker 
                onSelectAddress={(address) => setNewOwner(address)}
                buttonText="Use My Address"
              />
            </div>
            <Input
              id="new-owner"
              placeholder="0x..."
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <Button
            onClick={handleTransferOwnership}
            disabled={!newOwner || isTransacting}
            variant="destructive"
            className="w-full gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Transfer Ownership
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}