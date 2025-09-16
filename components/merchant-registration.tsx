"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/hooks/use-wallet"
import { useChainCheck } from "@/hooks/use-chain-check"
import { publicClient, CONTRACTS, PAYMENT_GATEWAY_ABI } from "@/lib/web3"
import { sepolia } from "viem/chains"
import { useToast } from "@/hooks/use-toast"
import { Store, AlertCircle, CheckCircle } from "lucide-react"

export function MerchantRegistration() {
  const { address, walletClient, isConnected } = useWallet()
  const { ensureCorrectChain } = useChainCheck()
  const { toast } = useToast()
  
  const [merchantName, setMerchantName] = useState("")
  const [website, setWebsite] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = async () => {
    if (!walletClient || !address) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!merchantName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a merchant name",
        variant: "destructive",
      })
      return
    }

    // Ensure correct chain
    const chainSwitched = await ensureCorrectChain()
    if (!chainSwitched) {
      toast({
        title: "Chain Error",
        description: "Please switch to Sepolia network",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)
    
    try {
      const registerHash = await walletClient.writeContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "registerMerchant",
        args: [merchantName.trim(), website.trim()],
        account: address as `0x${string}`,
        chain: sepolia,
      })

      await publicClient.waitForTransactionReceipt({ hash: registerHash })

      toast({
        title: "Registration Successful",
        description: "You have been registered as a merchant! You can now create payments.",
      })

      // Refresh page to update merchant status
      window.location.reload()
    } catch (err) {
      console.error("Merchant registration failed:", err)
      toast({
        title: "Registration Failed",
        description: "Failed to register as merchant. Please try again.",
        variant: "destructive",
      })
    }

    setIsRegistering(false)
  }

  if (!isConnected) {
    return null
  }

  return (
    <Card className="bg-card border-border max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
          <Store className="h-6 w-6 text-orange-500" />
        </div>
        <CardTitle className="text-card-foreground">Register as Merchant</CardTitle>
        <CardDescription className="text-muted-foreground">
          Register to create and process payments for the image generator
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="border-blue-500/20 bg-blue-500/5">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            You need to be a registered merchant to use the Payment Gateway features
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchant-name" className="text-card-foreground">
              Merchant Name *
            </Label>
            <Input
              id="merchant-name"
              placeholder="Enter your merchant name..."
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="bg-input border-border text-foreground"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-card-foreground">
              Website (optional)
            </Label>
            <Input
              id="website"
              placeholder="https://your-website.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-input border-border text-foreground"
              maxLength={100}
            />
          </div>

          <Button
            onClick={handleRegister}
            disabled={isRegistering || !merchantName.trim()}
            className="w-full gap-2"
          >
            {isRegistering ? (
              <>
                <AlertCircle className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Register as Merchant
              </>
            )}
          </Button>
        </div>

        <Alert className="border-green-500/20 bg-green-500/5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 text-sm">
            <strong>Note:</strong> Registration is free and permanent. You can start processing payments immediately after registration.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}