"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/hooks/use-wallet"
import { CreditCard, Send, History, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  amount: string
  description: string
  status: "pending" | "completed" | "refunded"
  timestamp: string
  recipient?: string
}

export function PaymentGateway() {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  
  // Mock data - in real app this would come from hooks
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      amount: "100",
      description: "Test payment",
      status: "completed",
      timestamp: "2024-01-15T10:30:00Z",
      recipient: "0x742d35Cc6570C4D8eF3c2db4F2Af4f4D4Eac44a9"
    },
    {
      id: "2", 
      amount: "50",
      description: "Service payment",
      status: "pending",
      timestamp: "2024-01-15T09:15:00Z"
    }
  ])

  const [createForm, setCreateForm] = useState({
    amount: "",
    recipient: "",
    description: ""
  })
  const [isTransacting, setIsTransacting] = useState(false)

  const handleCreatePayment = async () => {
    if (!createForm.amount || !createForm.recipient || !createForm.description) return

    setIsTransacting(true)
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newPayment: Payment = {
        id: (payments.length + 1).toString(),
        amount: createForm.amount,
        description: createForm.description,
        status: "pending",
        timestamp: new Date().toISOString(),
        recipient: createForm.recipient
      }
      
      setPayments(prev => [newPayment, ...prev])
      
      toast({
        title: "Payment Created",
        description: `Payment of ${createForm.amount} THY created successfully`,
      })
      
      setCreateForm({ amount: "", recipient: "", description: "" })
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
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setPayments(prev => 
        prev.map(p => 
          p.id === paymentId 
            ? { ...p, status: "completed" as const }
            : p
        )
      )
      
      toast({
        title: "Payment Processed",
        description: "Payment completed successfully",
      })
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to process payment",
        variant: "destructive",
      })
    }
    
    setIsTransacting(false)
  }

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "refunded":
        return "text-red-600 bg-red-100"
    }
  }

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "refunded":
        return <AlertCircle className="h-4 w-4" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payment Gateway</h2>
        <p className="text-muted-foreground">Create and manage THY token payments</p>
      </div>

      {/* Payment Interface */}
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Send className="h-5 w-5" />
                Create New Payment
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Send THY tokens to another address with optional description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-500/20 bg-blue-500/5">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  All payments are processed on Sepolia testnet with THY tokens
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-card-foreground">
                  Amount (THY)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-card-foreground">
                  Recipient Address
                </Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={createForm.recipient}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-card-foreground">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Payment for services..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <Button
                onClick={handleCreatePayment}
                disabled={!createForm.amount || !createForm.recipient || !createForm.description || isTransacting}
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
                Your recent payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1 capitalize">{payment.status}</span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-card-foreground">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Amount: {payment.amount} THY
                          {payment.recipient && (
                            <span className="ml-2">
                              To: {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                            </span>
                          )}
                        </p>
                      </div>
                      
                      {payment.status === "pending" && (
                        <Button
                          onClick={() => handleProcessPayment(payment.id)}
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

      {/* Fee Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Fee Structure</CardTitle>
          <CardDescription className="text-muted-foreground">
            Current payment processing fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-lg font-semibold text-card-foreground">1.5%</p>
              <p className="text-sm text-muted-foreground">Processing Fee</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-lg font-semibold text-card-foreground">~$0.10</p>
              <p className="text-sm text-muted-foreground">Network Fee</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-lg font-semibold text-card-foreground">Instant</p>
              <p className="text-sm text-muted-foreground">Settlement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}