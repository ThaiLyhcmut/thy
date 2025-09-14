"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLiquidityMining, LOYALTY_TIERS } from "@/hooks/use-liquidity-mining"
import { useWallet } from "@/hooks/use-wallet"
import { TrendingUp, Plus, Minus, AlertTriangle, Trophy, Coins, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LiquidityMining() {
  const { isConnected } = useWallet()
  const {
    poolStats,
    userStats,
    userTier,
    isLoading,
    error,
    deposit,
    withdraw,
    claimRewards,
    emergencyWithdraw,
    refetch,
  } = useLiquidityMining()
  const { toast } = useToast()

  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isTransacting, setIsTransacting] = useState(false)

  const handleDeposit = async () => {
    if (!depositAmount) return

    setIsTransacting(true)
    const hash = await deposit(depositAmount)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Deposit Successful",
        description: `Deposited ${depositAmount} THY tokens`,
      })
      setDepositAmount("")
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return

    setIsTransacting(true)
    const hash = await withdraw(withdrawAmount)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Withdraw Successful",
        description: `Withdrew ${withdrawAmount} THY tokens`,
      })
      setWithdrawAmount("")
    }
  }

  const handleClaimRewards = async () => {
    setIsTransacting(true)
    const hash = await claimRewards()
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Rewards Claimed",
        description: "Successfully claimed your pending rewards",
      })
    }
  }

  const handleEmergencyWithdraw = async () => {
    if (!confirm("Emergency withdraw will forfeit all pending rewards. Continue?")) return

    setIsTransacting(true)
    const hash = await emergencyWithdraw()
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Emergency Withdraw Successful",
        description: "Emergency withdrew all staked tokens",
        variant: "destructive",
      })
    }
  }

  const getCurrentTierInfo = () => {
    if (!userTier) return LOYALTY_TIERS[0]
    return LOYALTY_TIERS[userTier.tierIndex] || LOYALTY_TIERS[0]
  }

  const calculateTierProgress = () => {
    if (!userStats || !userTier) return 0

    const currentTier = LOYALTY_TIERS[userTier.tierIndex]
    const nextTier = LOYALTY_TIERS[userTier.tierIndex + 1]

    if (!nextTier) return 100 // Already at max tier

    const stakingDays = Number(userStats.stakingDuration)
    const progress = Math.min(100, (stakingDays / nextTier.minDays) * 100)

    return progress
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-card-foreground">Connect Your Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please connect your wallet to access liquidity mining
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
          <h2 className="text-2xl font-bold text-foreground">Liquidity Mining</h2>
          <p className="text-muted-foreground">Earn rewards through yield farming with loyalty tiers</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Loyalty Tiers Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Loyalty Tiers
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Stake longer to unlock higher reward multipliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {LOYALTY_TIERS.map((tier, index) => (
              <div key={tier.name} className="text-center p-4 rounded-lg border border-border">
                <div className={`w-8 h-8 rounded-full ${tier.color} mx-auto mb-2`} />
                <h3 className="font-semibold text-card-foreground">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.multiplier}</p>
                <p className="text-xs text-muted-foreground mt-1">Min: {tier.minDays} days</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {/* Pool Stats */}
      {poolStats && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Pool Statistics</CardTitle>
            <CardDescription className="text-muted-foreground">Current pool performance and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-lg font-semibold text-card-foreground">{poolStats.totalStaked} THY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-lg font-semibold text-card-foreground">{poolStats.totalUsers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current APR</p>
                <p className="text-lg font-semibold text-accent">{poolStats.currentAPR}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-lg font-semibold text-card-foreground">{poolStats.totalRewardsDistributed} THY</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Pool Interface */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">THY Liquidity Mining Pool</CardTitle>
              <CardDescription className="text-muted-foreground">
                Stake THY tokens to earn rewards with loyalty multipliers
              </CardDescription>
            </div>
            {poolStats && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {poolStats.currentAPR}% APR
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Stats */}
          {userStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Your Stake</p>
                  <p className="text-lg font-semibold text-card-foreground">{userStats.stakedAmount} THY</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  <p className="text-lg font-semibold text-accent">{userStats.pendingRewards} THY</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Claimed</p>
                  <p className="text-lg font-semibold text-card-foreground">{userStats.totalClaimed} THY</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Staking Duration</p>
                  <p className="text-lg font-semibold text-card-foreground">{userStats.stakingDuration} days</p>
                </div>
              </div>

              {/* Loyalty Tier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Current Tier</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getCurrentTierInfo().color}`} />
                    <span className="text-sm font-medium text-card-foreground">{getCurrentTierInfo().name}</span>
                    <span className="text-xs text-muted-foreground">({userStats.tierMultiplier})</span>
                  </div>
                </div>
                {calculateTierProgress() < 100 && userTier && LOYALTY_TIERS[userTier.tierIndex + 1] && (
                  <div className="space-y-1">
                    <Progress value={calculateTierProgress()} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Progress to {LOYALTY_TIERS[userTier.tierIndex + 1].name}
                    </p>
                  </div>
                )}
              </div>

              {/* Claim Rewards Button */}
              {Number.parseFloat(userStats.pendingRewards) > 0 && (
                <Button onClick={handleClaimRewards} disabled={isTransacting} className="w-full gap-2">
                  <Coins className="h-4 w-4" />
                  Claim {userStats.pendingRewards} THY Rewards
                </Button>
              )}
            </div>
          )}

          {/* Deposit */}
          <div className="space-y-2">
            <Label htmlFor="deposit" className="text-card-foreground">
              Deposit Amount
            </Label>
            <div className="flex gap-2">
              <Input
                id="deposit"
                type="number"
                placeholder="0.0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <Button onClick={handleDeposit} disabled={!depositAmount || isTransacting} className="gap-2">
                <Plus className="h-4 w-4" />
                Deposit
              </Button>
            </div>
          </div>

          {/* Withdraw */}
          {userStats && Number.parseFloat(userStats.stakedAmount) > 0 && (
            <div className="space-y-2">
              <Label htmlFor="withdraw" className="text-card-foreground">
                Withdraw Amount
              </Label>
              <div className="flex gap-2">
                <Input
                  id="withdraw"
                  type="number"
                  placeholder="0.0"
                  max={userStats.stakedAmount}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <Button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || isTransacting}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Minus className="h-4 w-4" />
                  Withdraw
                </Button>
              </div>
              <Button
                onClick={handleEmergencyWithdraw}
                disabled={isTransacting}
                variant="destructive"
                size="sm"
                className="w-full gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Emergency Withdraw (Forfeit Rewards)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && !poolStats && (
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
            <CardTitle className="text-card-foreground">Loading Pool Data</CardTitle>
            <CardDescription className="text-muted-foreground">
              Fetching liquidity mining information...
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
