"use client"

import { useState } from "react"
import { ImageGeneratorApi } from "@/components/image-generator-api"
import { MinigameWordGenerator } from "@/components/minigame-word-generator"
import { PhraseGenerator } from "@/components/phrase-generator"
import { ChainWarning } from "@/components/chain-warning"
import { WalletConnect } from "@/components/wallet-connect"
import { ArrowLeft, Image, Gamepad2, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GeneratorPage() {
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("words")

  const handleWordsGenerated = (words: string[]) => {
    setSelectedWords(words)
  }

  const handleSendToImageGen = (words: string[]) => {
    setSelectedWords(words)
    setActiveTab("images")
  }

  const handlePhrasesToImageGen = (phrases: string[]) => {
    setSelectedWords(phrases)
    setActiveTab("images")
  }

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
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Generator Hub</h1>
                  <p className="text-sm text-muted-foreground">Word vocabulary & image generator for Vietnamese puzzles</p>
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="words" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Word Generator
              </TabsTrigger>
              <TabsTrigger value="phrases" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Phrases
                {selectedPhrases.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {selectedPhrases.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image Generator
                {selectedWords.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {selectedWords.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="words" className="space-y-6">
              <MinigameWordGenerator onWordsSelected={handleSendToImageGen} />
            </TabsContent>

            <TabsContent value="phrases" className="space-y-6">
              <PhraseGenerator
                selectedPhrases={selectedPhrases}
                onPhrasesChange={setSelectedPhrases}
                onSendToImageGen={handlePhrasesToImageGen}
              />
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <ImageGeneratorApi selectedWords={selectedWords} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}