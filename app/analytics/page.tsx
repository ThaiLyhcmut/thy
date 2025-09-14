import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { WalletConnect } from "@/components/wallet-connect"
import { ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AnalyticsPage() {
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
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Analytics Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Comprehensive ecosystem insights</p>
                </div>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnalyticsDashboard />
      </main>
    </div>
  )
}
