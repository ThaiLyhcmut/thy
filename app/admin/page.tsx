import { AdminOverview } from "@/components/admin/admin-overview"
import { ChainWarning } from "@/components/chain-warning"
import { WalletConnect } from "@/components/wallet-connect"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Contract administration panel</p>
                </div>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Chain Warning */}
          <ChainWarning />
          
          {/* Security Warning */}
          <Alert className="border-yellow-500/20 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              <strong>Admin Access Required:</strong> Only contract owners can access these functions. 
              Connect with the owner wallet to manage contracts.
            </AlertDescription>
          </Alert>

          {/* Admin Overview */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Contract Administration</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage all THY ecosystem contracts from a single dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">THY Token</p>
                  <p className="text-lg font-semibold text-card-foreground">Pause, Mint, Transfer</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Liquidity Mining</p>
                  <p className="text-lg font-semibold text-card-foreground">Rewards, Pools, Emergency</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Staking</p>
                  <p className="text-lg font-semibold text-card-foreground">Create Pools, Set Rates</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Payment Gateway</p>
                  <p className="text-lg font-semibold text-card-foreground">Fees, Merchants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Panels */}
          <AdminOverview />
        </div>
      </main>
    </div>
  )
}