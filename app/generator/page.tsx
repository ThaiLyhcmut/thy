"use client"

import { useState } from "react"
import { ImageGeneratorApi } from "@/components/image-generator-api"
import { ChainWarning } from "@/components/chain-warning"
import { WalletConnect } from "@/components/wallet-connect"
import { ArrowLeft, Image } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
export default function GeneratorPage() {
  const [selectedWords, setSelectedWords] = useState<string[]>([])

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
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Image Generator</h1>
                  <p className="text-sm text-muted-foreground">Advanced image generator with word vocabulary for Vietnamese puzzles</p>
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
          <ChainWarning />
          <ImageGeneratorApi selectedWords={selectedWords} />
        </div>
      </main>
    </div>
  )
}