"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useThyToken } from "@/hooks/use-thy-token"
import { useWallet } from "@/hooks/use-wallet"
import { Coins, Send, Plus, Minus, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TokenDashboard() {
  const { isConnected } = useWallet()
  const { tokenData, isLoading, error, transfer, mint, burn, refetch } = useThyToken()
  const { toast } = useToast()

  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [mintTo, setMintTo] = useState("")
  const [mintAmount, setMintAmount] = useState("")
  const [burnAmount, setBurnAmount] = useState("")
  const [isTransacting, setIsTransacting] = useState(false)

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) return

    setIsTransacting(true)
    const hash = await transfer(transferTo, transferAmount)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Transfer Successful",
        description: `Transferred ${transferAmount} THY tokens`,
      })
      setTransferTo("")
      setTransferAmount("")
    }
  }

  const handleMint = async () => {
    if (!mintTo || !mintAmount) return

    setIsTransacting(true)
    const hash = await mint(mintTo, mintAmount)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Mint Successful",
        description: `Minted ${mintAmount} THY tokens`,
      })
      setMintTo("")
      setMintAmount("")
    }
  }

  const handleBurn = async () => {
    if (!burnAmount) return

    setIsTransacting(true)
    const hash = await burn(burnAmount)
    setIsTransacting(false)

    if (hash) {
      toast({
        title: "Burn Successful",
        description: `Burned ${burnAmount} THY tokens`,
      })
      setBurnAmount("")
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Coins className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-card-foreground">Connect Your Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please connect your wallet to access the token dashboard
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Your Balance</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? "..." : tokenData?.balance || "0"} THY
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={refetch} disabled={isLoading}>
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              {tokenData?.isPaused && (
                <Badge variant="destructive" className="text-xs">
                  Paused
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Supply</CardTitle>
            <Plus className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? "..." : tokenData?.totalSupply || "0"} THY
            </div>
            <p className="text-xs text-muted-foreground mt-2">Circulating supply</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Token Info</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm text-card-foreground">
                <span className="font-medium">{tokenData?.name || "THY Token"}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Symbol: {tokenData?.symbol || "THY"} • Decimals: {tokenData?.decimals || 18}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {/* Token Operations */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Token Operations</CardTitle>
          <CardDescription className="text-muted-foreground">Transfer, mint, and burn THY tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfer" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="mint">Mint</TabsTrigger>
              <TabsTrigger value="burn">Burn</TabsTrigger>
            </TabsList>

            <TabsContent value="transfer" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-to" className="text-card-foreground">
                  Recipient Address
                </Label>
                <Input
                  id="transfer-to"
                  placeholder="0x..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-amount" className="text-card-foreground">
                  Amount
                </Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="0.0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Button
                onClick={handleTransfer}
                disabled={!transferTo || !transferAmount || isTransacting}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {isTransacting ? "Transferring..." : "Transfer THY"}
              </Button>
            </TabsContent>

            <TabsContent value="mint" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mint-to" className="text-card-foreground">
                  Mint To Address
                </Label>
                <Input
                  id="mint-to"
                  placeholder="0x..."
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mint-amount" className="text-card-foreground">
                  Amount
                </Label>
                <Input
                  id="mint-amount"
                  type="number"
                  placeholder="0.0"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Button onClick={handleMint} disabled={!mintTo || !mintAmount || isTransacting} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                {isTransacting ? "Minting..." : "Mint THY"}
              </Button>
            </TabsContent>

            <TabsContent value="burn" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="burn-amount" className="text-card-foreground">
                  Amount to Burn
                </Label>
                <Input
                  id="burn-amount"
                  type="number"
                  placeholder="0.0"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Button
                onClick={handleBurn}
                disabled={!burnAmount || isTransacting}
                variant="destructive"
                className="w-full gap-2"
              >
                <Minus className="h-4 w-4" />
                {isTransacting ? "Burning..." : "Burn THY"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
