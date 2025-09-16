import { WalletConnect } from "@/components/wallet-connect"
import { AdminButton } from "@/components/admin-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Coins, TrendingUp, Users, BarChart3, ArrowRight, Image } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Coins className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">THY Ecosystem</h1>
                <p className="text-sm text-muted-foreground">DeFi Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AdminButton />
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Welcome to THY Ecosystem</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            A comprehensive DeFi platform featuring liquidity mining, multi-pool staking, and advanced analytics for the
            THY Token ecosystem.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Value Locked</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">$2.4M</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Active Stakers</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">1,234</div>
              <p className="text-xs text-muted-foreground">+8.2% from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Average APY</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">24.5%</div>
              <p className="text-xs text-muted-foreground">Across all pools</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">THY Price</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">$0.85</div>
              <p className="text-xs text-muted-foreground">+5.3% today</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-card-foreground">Token Management</CardTitle>
                  <Badge variant="default" className="mt-1 bg-primary text-primary-foreground">
                    Available
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-muted-foreground">
                Manage your THY tokens with transfer, mint, and burn capabilities. Full control over your token
                operations.
              </CardDescription>
              <Link href="/token">
                <Button className="w-full gap-2">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-secondary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-card-foreground">Liquidity Mining</CardTitle>
                  <Badge variant="default" className="mt-1 bg-secondary text-secondary-foreground">
                    Available
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-muted-foreground">
                Earn rewards through yield farming with loyalty tiers. Progress from Bronze to Platinum for higher
                rewards.
              </CardDescription>
              <Link href="/farming">
                <Button variant="secondary" className="w-full gap-2">
                  Start Farming
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-card-foreground">Multi-Pool Staking</CardTitle>
                  <Badge variant="default" className="mt-1 bg-accent text-accent-foreground">
                    Available
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-muted-foreground">
                Stake in multiple pools with different durations and APY rates. From 30 days to 365 days with up to 50%
                APY.
              </CardDescription>
              <Link href="/staking">
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-accent/10 border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Start Staking
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-card-foreground">Payment Gateway</CardTitle>
                  <Badge variant="default" className="mt-1 bg-purple-500 text-white">
                    Available
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-muted-foreground">
                Secure crypto payments with THY tokens. Create payments, manage transactions, and track history.
              </CardDescription>
              <Link href="/payments">
                <Button variant="outline" className="w-full gap-2 bg-purple-500/10 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                  Access Gateway
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-orange-500/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Image className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-card-foreground">Image Generator</CardTitle>
                  <Badge variant="default" className="mt-1 bg-orange-500 text-white">
                    New
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-muted-foreground">
                Generate Vietnamese word puzzle images. Pay with THY tokens - 0.01 THY per image.
              </CardDescription>
              <Link href="/generator">
                <Button variant="outline" className="w-full gap-2 bg-orange-500/10 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                  Create Images
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Contract Information */}
        <div className="mt-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Contract Addresses (Sepolia Testnet)</CardTitle>
              <CardDescription className="text-muted-foreground">
                Verified smart contracts powering the THY ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-card-foreground mb-1">THY Token</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                    0xE32B76EC0Bf09F20f9C1fa3200fFEd5E8979C6d7
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground mb-1">Liquidity Mining</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                    0xD088dDD335B9893b8C1327ea6e4cb8de93a975ad
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground mb-1">Payment Gateway</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                    0xf786EAe3757e2E4dE3283Ff61FE99647b3C37b20
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
