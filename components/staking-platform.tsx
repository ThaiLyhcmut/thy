"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStaking } from "@/hooks/use-staking"
import { useWallet } from "@/hooks/use-wallet"
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Coins,
  Zap,
  Timer,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function StakingPlatform() {
  const { isConnected } = useWallet()
  const { pools, userStakes, isLoading, error, stake, withdraw, emergencyWithdraw, compoundRewards, refetch } =
    useStaking()
  const { toast } = useToast()

  const [stakeAmounts, setStakeAmounts] = useState<Record<number, string>>({})
  const [autoCompoundSettings, setAutoCompoundSettings] = useState<Record<number, boolean>>({})
  const [isTransacting, setIsTransacting] = useState(false)

  const handleStake = async (poolId: number) => {
    const amount = stakeAmounts[poolId]
    const autoCompound = autoCompoundSettings[poolId] || false

    if (!amount) return

    setIsTransacting(true)
    const hash = await stake(poolId, amount, autoCompound)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Stake Successful",
        description: `Staked ${amount} THY in ${pools[poolId]?.name}`,
      })
      setStakeAmounts((prev) => ({ ...prev, [poolId]: "" }))
    }
  }

  const handleWithdraw = async (stakeId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to withdraw",
        variant: "destructive",
      })
      return
    }

    setIsTransacting(true)

    try {
      console.log("[v0] Starting withdraw for stake ID:", stakeId)

      const hash = await withdraw(stakeId)

      if (hash) {
        toast({
          title: "Withdraw Successful",
          description: "Successfully withdrew stake and rewards",
        })
        setTimeout(() => {
          refetch()
        }, 2000) // Wait 2 seconds for blockchain confirmation
      } else {
        toast({
          title: "Withdraw Failed",
          description: "Transaction was rejected or failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Withdraw error:", error)
      toast({
        title: "Withdraw Error",
        description: error instanceof Error ? error.message : "An error occurred during withdrawal",
        variant: "destructive",
      })
    } finally {
      setIsTransacting(false)
    }
  }

  const handleEmergencyWithdraw = async (stakeId: number) => {
    if (!confirm("Emergency withdraw will incur a 25% penalty and forfeit all rewards. Continue?")) return

    setIsTransacting(true)
    const hash = await emergencyWithdraw(stakeId)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Emergency Withdraw Complete",
        description: "Withdrew with 25% penalty applied",
        variant: "destructive",
      })
    }
  }

  const handleCompound = async (stakeId: number) => {
    setIsTransacting(true)
    const hash = await compoundRewards(stakeId)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Rewards Compounded",
        description: "Successfully compounded pending rewards",
      })
    }
  }

  const formatDaysRemaining = (days: number) => {
    if (days <= 0) return "Ready to withdraw"
    if (days === 1) return "1 day remaining"
    return `${days} days remaining`
  }

  const calculateProjectedRewards = (amount: string, apy: string, days: number) => {
    const principal = Number.parseFloat(amount)
    const rate = Number.parseFloat(apy.replace("%", "")) / 100
    const dailyRate = rate / 365
    return (principal * dailyRate * days).toFixed(2)
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-card-foreground">Connect Your Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please connect your wallet to access staking pools
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Multi-Pool Staking</h2>
          <p className="text-muted-foreground">Stake THY tokens for guaranteed returns with flexible lock periods</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pools" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pools">Staking Pools</TabsTrigger>
          <TabsTrigger value="stakes">My Stakes</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-6">
          {/* Staking Pools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pools.map((pool) => (
              <Card key={pool.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-card-foreground">{pool.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Lock for {pool.lockPeriod} days • Min: {pool.minStakeAmount} THY
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-accent/10 text-accent text-lg font-bold">
                      {pool.apy}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pool Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Lock Period</p>
                      <p className="font-semibold text-card-foreground">{pool.lockPeriod} days</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground">APY</p>
                      <p className="font-semibold text-accent">{pool.apy}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Coins className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Min Stake</p>
                      <p className="font-semibold text-card-foreground">{pool.minStakeAmount} THY</p>
                    </div>
                  </div>

                  {/* Projected Rewards Calculator */}
                  {stakeAmounts[pool.id] && (
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="text-sm font-medium text-card-foreground mb-2">Projected Rewards</h4>
                      <p className="text-lg font-bold text-accent">
                        {calculateProjectedRewards(stakeAmounts[pool.id], pool.apy, pool.lockPeriod)} THY
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total return:{" "}
                        {(
                          Number.parseFloat(stakeAmounts[pool.id]) +
                          Number.parseFloat(calculateProjectedRewards(stakeAmounts[pool.id], pool.apy, pool.lockPeriod))
                        ).toFixed(2)}{" "}
                        THY
                      </p>
                    </div>
                  )}

                  {/* Stake Input */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`stake-${pool.id}`} className="text-card-foreground">
                        Stake Amount
                      </Label>
                      <Input
                        id={`stake-${pool.id}`}
                        type="number"
                        placeholder={`Min: ${pool.minStakeAmount} THY`}
                        value={stakeAmounts[pool.id] || ""}
                        onChange={(e) => setStakeAmounts((prev) => ({ ...prev, [pool.id]: e.target.value }))}
                        className="bg-input border-border text-foreground"
                      />
                    </div>

                    {/* Auto-Compound Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-card-foreground">Auto-Compound</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically compound rewards for higher returns
                        </p>
                      </div>
                      <Switch
                        checked={autoCompoundSettings[pool.id] || false}
                        onCheckedChange={(checked) =>
                          setAutoCompoundSettings((prev) => ({ ...prev, [pool.id]: checked }))
                        }
                      />
                    </div>

                    <Button
                      onClick={() => handleStake(pool.id)}
                      disabled={
                        !stakeAmounts[pool.id] ||
                        Number.parseFloat(stakeAmounts[pool.id]) < Number.parseFloat(pool.minStakeAmount) ||
                        isTransacting
                      }
                      className="w-full gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {isTransacting ? "Staking..." : `Stake in ${pool.name}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stakes" className="space-y-6">
          {/* User Stakes */}
          {userStakes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userStakes.map((stake) => (
                <Card key={stake.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-card-foreground">Stake #{stake.id}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {stake.lockPeriod}-day lock • {(stake.rewardRate / 100).toFixed(0)}% APY
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant={stake.canWithdraw ? "default" : "secondary"}>
                          {stake.canWithdraw ? "Ready" : "Locked"}
                        </Badge>
                        {stake.autoCompound && (
                          <Badge variant="outline" className="ml-2">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Stake Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Staked Amount</p>
                        <p className="text-lg font-semibold text-card-foreground">{stake.amount} THY</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Rewards</p>
                        <p className="text-lg font-semibold text-accent">{stake.pendingRewards} THY</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Lock Progress</p>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDaysRemaining(stake.daysRemaining)}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={
                          stake.canWithdraw ? 100 : ((stake.lockPeriod - stake.daysRemaining) / stake.lockPeriod) * 100
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {stake.canWithdraw ? (
                        <Button
                          onClick={() => handleWithdraw(stake.id)}
                          disabled={isTransacting}
                          className="w-full gap-2"
                        >
                          <DollarSign className="h-4 w-4" />
                          {isTransacting ? "Withdrawing..." : "Withdraw All"}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          {Number.parseFloat(stake.pendingRewards) > 0 && !stake.autoCompound && (
                            <Button
                              onClick={() => handleCompound(stake.id)}
                              disabled={isTransacting}
                              variant="outline"
                              className="w-full gap-2"
                            >
                              <Zap className="h-4 w-4" />
                              {isTransacting ? "Compounding..." : "Compound Rewards"}
                            </Button>
                          )}
                          <Button
                            onClick={() => handleEmergencyWithdraw(stake.id)}
                            disabled={isTransacting}
                            variant="destructive"
                            size="sm"
                            className="w-full gap-2"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            Emergency Withdraw (25% penalty)
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Stake Details */}
                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Rewards</p>
                          <p className="text-card-foreground">{stake.accumulatedRewards} THY</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="text-card-foreground">{new Date(stake.endTime).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-card-foreground">No Active Stakes</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Start staking in one of our pools to earn rewards
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
