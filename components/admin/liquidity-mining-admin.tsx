"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/use-wallet"
import { Wheat, Settings, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { publicClient, CONTRACTS, LIQUIDITY_MINING_ABI } from "@/lib/web3"
import { sepolia } from "viem/chains"
import { parseUnits } from "viem"

export function LiquidityMiningAdmin() {
  const { address, walletClient } = useWallet()
  const { toast } = useToast()
  const [isOwner, setIsOwner] = useState(true) // Will be controlled by parent component
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [isTransacting, setIsTransacting] = useState(false)

  // Form states
  const [rewardPerBlock, setRewardPerBlock] = useState("")
  const [allocPoint, setAllocPoint] = useState("")
  const [depositFeeBP, setDepositFeeBP] = useState("")
  const [withdrawFeeBP, setWithdrawFeeBP] = useState("")
  const [bonusMultiplier, setBonusMultiplier] = useState("")

  // Owner check is handled by parent component

  if (!isOwner) return null

  const handleSetRewardPerBlock = async () => {
    if (!rewardPerBlock || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_LIQUIDITY_MINING,
        abi: LIQUIDITY_MINING_ABI,
        functionName: "setRewardPerBlock",
        args: [parseUnits(rewardPerBlock, 18)],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `Reward per block updated to ${rewardPerBlock} THY`,
      })
      setRewardPerBlock("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update reward per block",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleUpdatePoolInfo = async () => {
    if (!allocPoint || !depositFeeBP || !withdrawFeeBP || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_LIQUIDITY_MINING,
        abi: LIQUIDITY_MINING_ABI,
        functionName: "updatePoolInfo",
        args: [BigInt(allocPoint), BigInt(depositFeeBP), BigInt(withdrawFeeBP)],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: "Pool info updated successfully",
      })
      setAllocPoint("")
      setDepositFeeBP("")
      setWithdrawFeeBP("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update pool info",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleSetBonusMultiplier = async () => {
    if (!bonusMultiplier || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_LIQUIDITY_MINING,
        abi: LIQUIDITY_MINING_ABI,
        functionName: "setBonusMultiplier",
        args: [BigInt(bonusMultiplier)],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `Bonus multiplier set to ${bonusMultiplier}x`,
      })
      setBonusMultiplier("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to set bonus multiplier",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleToggleEmergencyMode = async () => {
    if (!walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_LIQUIDITY_MINING,
        abi: LIQUIDITY_MINING_ABI,
        functionName: "toggleEmergencyMode",
        args: [],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      setEmergencyMode(!emergencyMode)
      toast({
        title: "Success",
        description: `Emergency mode ${!emergencyMode ? "enabled" : "disabled"}`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to toggle emergency mode",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  return (
    <Card className="bg-card border-border border-2 border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-green-500" />
            <CardTitle className="text-card-foreground">Liquidity Mining Admin</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Owner Access
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          Configure liquidity mining parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="pool">Pool Config</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward-per-block" className="text-card-foreground">
                Reward Per Block (THY)
              </Label>
              <Input
                id="reward-per-block"
                type="number"
                placeholder="0.0"
                value={rewardPerBlock}
                onChange={(e) => setRewardPerBlock(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <Button
                onClick={handleSetRewardPerBlock}
                disabled={!rewardPerBlock || isTransacting}
                className="w-full gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Update Reward Rate
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-multiplier" className="text-card-foreground">
                Bonus Multiplier (e.g., 2 for 2x)
              </Label>
              <Input
                id="bonus-multiplier"
                type="number"
                placeholder="1"
                value={bonusMultiplier}
                onChange={(e) => setBonusMultiplier(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <Button
                onClick={handleSetBonusMultiplier}
                disabled={!bonusMultiplier || isTransacting}
                variant="secondary"
                className="w-full gap-2"
              >
                <Clock className="h-4 w-4" />
                Set Bonus Multiplier
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pool" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alloc-point" className="text-card-foreground">
                Allocation Points
              </Label>
              <Input
                id="alloc-point"
                type="number"
                placeholder="100"
                value={allocPoint}
                onChange={(e) => setAllocPoint(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-fee" className="text-card-foreground">
                Deposit Fee (Basis Points, 100 = 1%)
              </Label>
              <Input
                id="deposit-fee"
                type="number"
                placeholder="0"
                value={depositFeeBP}
                onChange={(e) => setDepositFeeBP(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-fee" className="text-card-foreground">
                Withdraw Fee (Basis Points, 100 = 1%)
              </Label>
              <Input
                id="withdraw-fee"
                type="number"
                placeholder="0"
                value={withdrawFeeBP}
                onChange={(e) => setWithdrawFeeBP(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <Button
              onClick={handleUpdatePoolInfo}
              disabled={!allocPoint || !depositFeeBP || !withdrawFeeBP || isTransacting}
              className="w-full gap-2"
            >
              <Settings className="h-4 w-4" />
              Update Pool Configuration
            </Button>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-card-foreground">Emergency Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Allows users to withdraw without rewards calculation
                  </p>
                </div>
                <Switch
                  checked={emergencyMode}
                  onCheckedChange={handleToggleEmergencyMode}
                  disabled={isTransacting}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}