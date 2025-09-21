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
import { Layers, Plus, Settings, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { publicClient, CONTRACTS, parseTokenAmount, STAKING_ABI } from "@/lib/web3"
import { sepolia } from "viem/chains"

export function StakingAdmin() {
  const { address, walletClient } = useWallet()
  const { toast } = useToast()
  const [isOwner, setIsOwner] = useState(true) // Will be controlled by parent component
  const [isTransacting, setIsTransacting] = useState(false)

  // Form states - Create Pool
  const [lockPeriod, setLockPeriod] = useState("")
  const [rewardRate, setRewardRate] = useState("")
  const [minStakeAmount, setMinStakeAmount] = useState("")

  // Form states - Update Pool
  const [poolId, setPoolId] = useState("")
  const [updateRewardRate, setUpdateRewardRate] = useState("")
  const [updateMinStakeAmount, setUpdateMinStakeAmount] = useState("")
  const [poolActive, setPoolActive] = useState(true)

  // Form states - Other
  const [fundAmount, setFundAmount] = useState("")
  const [earlyWithdrawPenalty, setEarlyWithdrawPenalty] = useState("")

  // Owner check is handled by parent component

  if (!isOwner) return null

  const handleCreatePool = async () => {
    if (!lockPeriod || !rewardRate || !minStakeAmount || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_STAKING,
        abi: STAKING_ABI,
        functionName: "createPool",
        args: [
          BigInt(Number(lockPeriod) * 86400), // Convert days to seconds
          BigInt(rewardRate),
          parseTokenAmount(minStakeAmount)
        ],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `New staking pool created with ${lockPeriod} days lock period`,
      })
      setLockPeriod("")
      setRewardRate("")
      setMinStakeAmount("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create pool",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleUpdatePool = async () => {
    if (!poolId || !updateRewardRate || !updateMinStakeAmount || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_STAKING,
        abi: STAKING_ABI,
        functionName: "updatePoolRewardRate",
        args: [
          BigInt(poolId),
          BigInt(updateRewardRate)
        ],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `Pool ${poolId} updated successfully`,
      })
      setPoolId("")
      setUpdateRewardRate("")
      setUpdateMinStakeAmount("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update pool",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleFundRewardPool = async () => {
    if (!fundAmount || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_STAKING,
        abi: STAKING_ABI,
        functionName: "addRewardPool",
        args: [parseTokenAmount(fundAmount)],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `Funded reward pool with ${fundAmount} THY`,
      })
      setFundAmount("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to fund reward pool",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleSetEarlyWithdrawPenalty = async () => {
    if (!earlyWithdrawPenalty || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_STAKING,
        abi: STAKING_ABI,
        functionName: "setEarlyWithdrawPenalty",
        args: [BigInt(Number(earlyWithdrawPenalty) * 100)], // Convert percentage to basis points
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `Early withdraw penalty set to ${earlyWithdrawPenalty}%`,
      })
      setEarlyWithdrawPenalty("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to set penalty",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  return (
    <Card className="bg-card border-border border-2 border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-card-foreground">Staking Admin</CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Owner Access
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          Manage staking pools and parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Pool</TabsTrigger>
            <TabsTrigger value="update">Update Pool</TabsTrigger>
            <TabsTrigger value="fund">Fund Rewards</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lock-period" className="text-card-foreground">
                Lock Period (Days)
              </Label>
              <Input
                id="lock-period"
                type="number"
                placeholder="30"
                value={lockPeriod}
                onChange={(e) => setLockPeriod(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-rate" className="text-card-foreground">
                Reward Rate (% APY)
              </Label>
              <Input
                id="reward-rate"
                type="number"
                placeholder="15"
                value={rewardRate}
                onChange={(e) => setRewardRate(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-stake" className="text-card-foreground">
                Minimum Stake Amount (THY)
              </Label>
              <Input
                id="min-stake"
                type="number"
                placeholder="100"
                value={minStakeAmount}
                onChange={(e) => setMinStakeAmount(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <Button
              onClick={handleCreatePool}
              disabled={!lockPeriod || !rewardRate || !minStakeAmount || isTransacting}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Pool
            </Button>
          </TabsContent>

          <TabsContent value="update" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pool-id" className="text-card-foreground">
                Pool ID
              </Label>
              <Input
                id="pool-id"
                type="number"
                placeholder="0"
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-reward-rate" className="text-card-foreground">
                New Reward Rate (% APY)
              </Label>
              <Input
                id="update-reward-rate"
                type="number"
                placeholder="20"
                value={updateRewardRate}
                onChange={(e) => setUpdateRewardRate(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-min-stake" className="text-card-foreground">
                New Minimum Stake (THY)
              </Label>
              <Input
                id="update-min-stake"
                type="number"
                placeholder="50"
                value={updateMinStakeAmount}
                onChange={(e) => setUpdateMinStakeAmount(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <Label htmlFor="pool-active" className="text-card-foreground">
                Pool Active
              </Label>
              <Switch
                id="pool-active"
                checked={poolActive}
                onCheckedChange={setPoolActive}
              />
            </div>

            <Button
              onClick={handleUpdatePool}
              disabled={!poolId || !updateRewardRate || !updateMinStakeAmount || isTransacting}
              className="w-full gap-2"
            >
              <Settings className="h-4 w-4" />
              Update Pool
            </Button>
          </TabsContent>

          <TabsContent value="fund" className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 space-y-2">
              <p className="text-sm font-medium text-card-foreground">Fund Reward Pool</p>
              <p className="text-xs text-muted-foreground">
                Add THY tokens to the reward pool for distribution to stakers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund-amount" className="text-card-foreground">
                Amount to Fund (THY)
              </Label>
              <Input
                id="fund-amount"
                type="number"
                placeholder="10000"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <Button
              onClick={handleFundRewardPool}
              disabled={!fundAmount || isTransacting}
              className="w-full gap-2"
            >
              <Wallet className="h-4 w-4" />
              Fund Reward Pool
            </Button>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="penalty" className="text-card-foreground">
                Early Withdraw Penalty (%)
              </Label>
              <Input
                id="penalty"
                type="number"
                placeholder="25"
                value={earlyWithdrawPenalty}
                onChange={(e) => setEarlyWithdrawPenalty(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Current default is 25%. This applies when users withdraw before lock period ends.
              </p>
            </div>

            <Button
              onClick={handleSetEarlyWithdrawPenalty}
              disabled={!earlyWithdrawPenalty || isTransacting}
              variant="destructive"
              className="w-full"
            >
              Update Penalty
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}