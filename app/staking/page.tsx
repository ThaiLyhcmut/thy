import { StakingPlatform } from "@/components/staking-platform"
import { WalletConnect } from "@/components/wallet-connect"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StakingPage() {
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
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Multi-Pool Staking</h1>
                  <p className="text-sm text-muted-foreground">Flexible lock periods with guaranteed returns</p>
                </div>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <StakingPlatform />
      </main>
    </div>
  )
}
