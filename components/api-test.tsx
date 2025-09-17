"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { parseUnits } from "viem"
import { AlertCircle, CheckCircle, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = "https://thygateaway.thaily.id.vn"
const MERCHANT_API_KEY = "thy_83fc9270094fc6e5caaf696ca7203dc4d672abc5492c588533abb241a5499cd6"

export function ApiTest() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [apiResult, setApiResult] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown')

  const testApiConnection = async () => {
    if (!address) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setApiResult(null)
    
    try {
      console.log("Testing API connection...")
      console.log("API URL:", `${API_BASE_URL}/api/payments/create`)
      console.log("API Key:", MERCHANT_API_KEY.substring(0, 20) + "...")
      console.log("User Address:", address)

      const testPayload = {
        amount: 0.05, // 0.05 THY = 5 images (number, not string)
        currency: 'THY',
        orderId: `test_${Date.now()}`,
        customerAddress: address,
        metadata: { // object, not string
          description: 'API Test - 5 images',
          imageCount: 5,
          type: 'image_generation'
        },
        webhookUrl: 'https://thy.thaily.id.vn/webhook'
      }

      console.log("Request payload:", testPayload)

      const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
        method: 'POST',
        headers: {
          'X-API-Key': MERCHANT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      const result = await response.json()
      console.log("Response body:", result)

      setApiResult(result)
      
      if (response.ok && result.success) {
        setConnectionStatus('connected')
        toast({
          title: "API Test Successful!",
          description: "Payment request created successfully",
        })
      } else {
        setConnectionStatus('failed')
        toast({
          title: "API Test Failed",
          description: result.error || `HTTP ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("API test failed:", error)
      setConnectionStatus('failed')
      setApiResult({ error: error?.toString() || 'Network error' })
      
      toast({
        title: "API Connection Failed",
        description: "Could not connect to backend server",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please connect your wallet to test API</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          API Connection Test
        </CardTitle>
        <CardDescription>
          Test connection to Payment Gateway API backend
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Wallet:</strong> {address}</p>
          <p><strong>API URL:</strong> {API_BASE_URL}</p>
          <p><strong>API Key:</strong> {MERCHANT_API_KEY.substring(0, 20)}...</p>
          
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            {connectionStatus === 'connected' && (
              <Badge className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
            {connectionStatus === 'failed' && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            )}
            {connectionStatus === 'unknown' && (
              <Badge variant="secondary">Unknown</Badge>
            )}
          </div>
        </div>

        <Button 
          onClick={testApiConnection}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing API..." : "Test API Connection"}
        </Button>

        {apiResult && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">API Response:</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}