"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { useChainCheck } from "@/hooks/use-chain-check"
import { publicClient, CONTRACTS, PAYMENT_GATEWAY_ABI } from "@/lib/web3"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PaymentTest() {
  const { address, walletClient, isConnected } = useWallet()
  const { ensureCorrectChain } = useChainCheck()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [merchantInfo, setMerchantInfo] = useState<any>(null)

  const testMerchantInfo = async () => {
    if (!address) return

    setIsLoading(true)
    
    try {
      console.log("Testing merchant info for address:", address)
      console.log("Payment Gateway contract:", CONTRACTS.THY_PAYMENT_GATEWAY)
      
      const result = await publicClient.readContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "getMerchantInfo",
        args: [address as `0x${string}`],
      })
      
      console.log("Raw result:", result)
      setMerchantInfo(result)
      
      toast({
        title: "Test Complete",
        description: "Check console for results",
      })
    } catch (error) {
      console.error("Test failed:", error)
      toast({
        title: "Test Failed",
        description: error?.toString() || "Unknown error",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  const testRegisterMerchant = async () => {
    if (!walletClient || !address) return

    const chainSwitched = await ensureCorrectChain()
    if (!chainSwitched) {
      toast({
        title: "Chain Error",
        description: "Please switch to Sepolia network",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      console.log("Registering merchant...")
      
      const registerHash = await walletClient.writeContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "registerMerchant",
        args: ["Test Merchant", "test.example.com"],
        account: address as `0x${string}`,
      })

      console.log("Registration tx:", registerHash)
      await publicClient.waitForTransactionReceipt({ hash: registerHash })

      toast({
        title: "Registration Successful",
        description: "Merchant registered successfully",
      })

      // Test merchant info again
      await testMerchantInfo()
    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration Failed",
        description: error?.toString() || "Unknown error",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please connect your wallet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Test</CardTitle>
          <CardDescription>Test Payment Gateway contract functions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Address:</strong> {address}</p>
            <p><strong>Contract:</strong> {CONTRACTS.THY_PAYMENT_GATEWAY}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testMerchantInfo}
              disabled={isLoading}
            >
              Test Merchant Info
            </Button>
            
            <Button 
              onClick={testRegisterMerchant}
              disabled={isLoading}
              variant="secondary"
            >
              Register as Merchant
            </Button>
          </div>

          {merchantInfo && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono">
                <strong>Merchant Info:</strong><br />
                {JSON.stringify(merchantInfo, null, 2)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}