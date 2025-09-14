"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAnalytics } from "@/hooks/use-analytics"
import { useWallet } from "@/hooks/use-wallet"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Coins,
  RefreshCw,
  AlertTriangle,
  Trophy,
  Target,
  Activity,
  PieChart,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts"

const COLORS = ["#15803d", "#84cc16", "#eab308", "#f97316", "#e53e3e"]

export function AnalyticsDashboard() {
  const { isConnected } = useWallet()
  const { analyticsData, chartData, poolAnalytics, userAnalytics, isLoading, error, refetch } = useAnalytics()

  const formatNumber = (num: string | number) => {
    const value = typeof num === "string" ? Number.parseFloat(num.replace(/,/g, "")) : num
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toFixed(0)
  }

  const pieChartData = poolAnalytics.map((pool) => ({
    name: pool.name,
    value: Number.parseFloat(pool.tvl.replace(/,/g, "")),
    color: COLORS[pool.poolId % COLORS.length],
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive insights into the THY ecosystem</p>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Value Locked</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">${analyticsData?.totalValueLocked || "0"}</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Stakers</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{analyticsData?.totalStakers || 0}</div>
                <p className="text-xs text-muted-foreground">+8.2% from last week</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">THY Price</CardTitle>
                <Coins className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">${analyticsData?.thyPrice || "0"}</div>
                <div className="flex items-center gap-1">
                  {analyticsData?.priceChange24h?.startsWith("+") ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <p className="text-xs text-muted-foreground">{analyticsData?.priceChange24h || "0"}% today</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Average APY</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{analyticsData?.averageAPY || "0"}%</div>
                <p className="text-xs text-muted-foreground">Across all pools</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Market Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">${analyticsData?.marketCap || "0"}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Circulating: {analyticsData?.circulatingSupply || "0"} THY
                </p>
                <p className="text-sm text-muted-foreground">Total: {analyticsData?.totalSupply || "0"} THY</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Staking Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">{analyticsData?.stakingRatio || "0"}%</div>
                <p className="text-sm text-muted-foreground mt-2">Of circulating supply staked</p>
                <Progress value={Number.parseFloat(analyticsData?.stakingRatio || "0")} className="mt-4" />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Total Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">
                  {analyticsData?.totalRewardsDistributed || "0"} THY
                </div>
                <p className="text-sm text-muted-foreground mt-2">Distributed to stakers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">TVL Over Time</CardTitle>
                <CardDescription className="text-muted-foreground">Total Value Locked (30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={formatNumber} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${formatNumber(value)}`, "TVL"]}
                    />
                    <Line type="monotone" dataKey="tvl" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">THY Price Chart</CardTitle>
                <CardDescription className="text-muted-foreground">Price movement (30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(3)}`, "Price"]}
                    />
                    <Line type="monotone" dataKey="price" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Active Stakers</CardTitle>
                <CardDescription className="text-muted-foreground">Number of stakers (30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value, "Stakers"]}
                    />
                    <Bar dataKey="stakers" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Pool Distribution</CardTitle>
                <CardDescription className="text-muted-foreground">TVL by pool</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${formatNumber(value)}`, "TVL"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pools" className="space-y-6">
          {/* Pool Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {poolAnalytics.map((pool) => (
              <Card key={pool.poolId} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-card-foreground">{pool.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">Pool #{pool.poolId}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {pool.apy}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value Locked</p>
                      <p className="text-xl font-bold text-card-foreground">${pool.tvl}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Stakers</p>
                      <p className="text-xl font-bold text-card-foreground">{pool.stakers}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Pool Utilization</p>
                      <p className="text-sm font-medium text-card-foreground">{pool.utilization}%</p>
                    </div>
                    <Progress value={pool.utilization} className="h-2" />
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-accent" />
                      <p className="text-sm text-muted-foreground">
                        Average stake: ${(Number.parseFloat(pool.tvl.replace(/,/g, "")) / pool.stakers).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {/* Personal Analytics */}
          {isConnected && userAnalytics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total Staked</CardTitle>
                    <Target className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{userAnalytics.totalStaked} THY</div>
                    <p className="text-xs text-muted-foreground">Across {userAnalytics.activeStakes} stakes</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total Rewards</CardTitle>
                    <DollarSign className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{userAnalytics.totalRewards} THY</div>
                    <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Portfolio Value</CardTitle>
                    <PieChart className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{userAnalytics.portfolioValue} THY</div>
                    <p className="text-xs text-muted-foreground">Staked + rewards</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Loyalty Tier</CardTitle>
                    <Trophy className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{userAnalytics.loyaltyTier}</div>
                    <p className="text-xs text-muted-foreground">Average APY: {userAnalytics.averageAPY}%</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Your Performance</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Personal staking statistics and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground mb-2">Staking Distribution</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Active Stakes</span>
                            <span className="text-card-foreground">{userAnalytics.activeStakes}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Average APY</span>
                            <span className="text-accent">{userAnalytics.averageAPY}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground mb-2">Achievements</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="gap-1">
                            <Trophy className="h-3 w-3" />
                            {userAnalytics.loyaltyTier} Tier
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Target className="h-3 w-3" />
                            Multi-Pool Staker
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Activity className="h-3 w-3" />
                            Long-term Holder
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-card-foreground">Connect Your Wallet</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Connect your wallet to view personal analytics and performance metrics
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
