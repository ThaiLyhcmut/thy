"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePaymentGateway } from "@/hooks/use-payment-gateway"
import { useWallet } from "@/hooks/use-wallet"
import { CreditCard, Send, History, AlertCircle, CheckCircle, Clock, Store, Users, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MerchantRegistration } from "./merchant-registration"
import { formatUnits } from "viem"

const PaymentStatusMap = {
  0: "pending",
  1: "completed", 
  2: "expired",
  3: "refunded",
  4: "disputed"
} as const

export function PaymentGatewayReal() {
  const { isConnected, address } = useWallet()
  const { 
    merchantInfo,
    paymentData,
    isLoading,
    error,
    PRICE_PER_IMAGE,
    createPayment,
    processPayment,
    getPaymentHistory,
    getTotalStats
  } = usePaymentGateway()
  const { toast } = useToast()
  
  const [createForm, setCreateForm] = useState({
    amount: "",
    description: ""
  })
  const [isTransacting, setIsTransacting] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const stats = getTotalStats()
  const paymentHistory = getPaymentHistory()

  const handleCreatePayment = async () => {
    if (!createForm.amount || !createForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsTransacting(true)
    
    try {
      // Calculate image count from amount (assuming 0.01 THY per image)
      const imageCount = Math.floor(parseFloat(createForm.amount) / PRICE_PER_IMAGE)
      
      if (imageCount === 0) {
        toast({
          title: "Invalid Amount",
          description: `Minimum amount is ${PRICE_PER_IMAGE} THY`,
          variant: "destructive",
        })
        setIsTransacting(false)
        return
      }

      const hash = await createPayment(imageCount, createForm.description)
      
      if (hash) {
        toast({
          title: "Payment Created",
          description: `Payment of ${createForm.amount} THY created successfully`,
        })
        setCreateForm({ amount: "", description: "" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment",
        variant: "destructive",
      })
    }
    
    setIsTransacting(false)
  }

  const handleProcessPayment = async (paymentId: string) => {
    setIsTransacting(true)
    
    try {
      const hash = await processPayment(paymentId)
      
      if (hash) {
        toast({
          title: "Payment Processed",
          description: "Payment completed successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to process payment",
        variant: "destructive",
      })
    }
    
    setIsTransacting(false)
  }

  const getStatusColor = (status: number) => {
    const statusString = PaymentStatusMap[status as keyof typeof PaymentStatusMap] || "pending"
    switch (statusString) {
      case "completed":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30"
      case "expired":
        return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30"
      case "refunded":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
      case "disputed":
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30"
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30"
    }
  }

  const getStatusIcon = (status: number) => {
    const statusString = PaymentStatusMap[status as keyof typeof PaymentStatusMap] || "pending"
    switch (statusString) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "expired":
      case "refunded":
      case "disputed":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-card-foreground">Connect Your Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please connect your wallet to access payment gateway
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!merchantInfo?.active) {
    return <MerchantRegistration />
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Merchant Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payment Gateway</h2>
          <p className="text-muted-foreground">Manage THY token payments with smart contracts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Store className="h-3 w-3" />
            {merchantInfo.name}
          </Badge>
          {merchantInfo.website && (
            <Badge variant="outline" className="text-xs">
              {merchantInfo.website}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalPaid}</div>
              <div className="text-sm text-muted-foreground">Total Paid THY</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{stats.availableCredits}</div>
              <div className="text-sm text-muted-foreground">Available Credits</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{paymentHistory.length}</div>
              <div className="text-sm text-muted-foreground">Total Payments</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{merchantInfo.totalReceived}</div>
              <div className="text-sm text-muted-foreground">Total Received</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Merchant Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="text-card-foreground">{merchantInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website:</span>
                  <span className="text-card-foreground text-sm">{merchantInfo.website || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fees Owed:</span>
                  <span className="text-card-foreground">{merchantInfo.feesOwed} THY</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per Credit:</span>
                  <span className="text-card-foreground">{PRICE_PER_IMAGE} THY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Credits:</span>
                  <span className="text-card-foreground">{stats.availableCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits Value:</span>
                  <span className="text-card-foreground">{stats.remainingValue} THY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee:</span>
                  <span className="text-card-foreground">2.0%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Send className="h-5 w-5" />
                Create New Payment
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create a payment request for credits (1 credit = 1 image generation)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-500/20 bg-blue-500/5">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  Payments use the Payment Gateway smart contract with automatic discount calculation
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-card-foreground">
                  Amount (THY)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder={`Minimum: ${PRICE_PER_IMAGE}`}
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
                {createForm.amount && (
                  <p className="text-xs text-muted-foreground">
                    = {Math.floor(parseFloat(createForm.amount) / PRICE_PER_IMAGE)} credits
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-card-foreground">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Payment for image generation credits..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <Button
                onClick={handleCreatePayment}
                disabled={!createForm.amount || !createForm.description || isTransacting}
                className="w-full gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {isTransacting ? "Creating Payment..." : "Create Payment"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <History className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your payment transactions from the smart contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.paymentId}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1 capitalize">
                              {PaymentStatusMap[payment.status as keyof typeof PaymentStatusMap] || "unknown"}
                            </span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.timestamp * 1000).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-card-foreground">{payment.orderId}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Amount: {payment.amount} THY → Final: {payment.finalAmount} THY</div>
                          {payment.discountAmount !== "0" && (
                            <div className="text-green-600">Discount: {payment.discountAmount} THY</div>
                          )}
                          <div>Payment ID: {payment.paymentId.slice(0, 10)}...{payment.paymentId.slice(-8)}</div>
                        </div>
                      </div>
                      
                      {payment.status === 0 && ( // Pending
                        <Button
                          onClick={() => handleProcessPayment(payment.paymentId)}
                          disabled={isTransacting}
                          size="sm"
                        >
                          Process
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}