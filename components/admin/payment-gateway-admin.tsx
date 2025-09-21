"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/use-wallet"
import { CreditCard, Users, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { publicClient, CONTRACTS, PAYMENT_GATEWAY_ABI } from "@/lib/web3"
import { sepolia } from "viem/chains"
import { WalletAddressPicker } from "@/components/wallet-address-picker"

export function PaymentGatewayAdmin() {
  const { address, walletClient } = useWallet()
  const { toast } = useToast()
  const [isOwner, setIsOwner] = useState(true) // Will be controlled by parent component
  const [isTransacting, setIsTransacting] = useState(false)

  // Form states
  const [tokenAddress, setTokenAddress] = useState("")
  const [feeRate, setFeeRate] = useState("")
  const [merchantId, setMerchantId] = useState("")
  const [merchantActive, setMerchantActive] = useState(true)
  const [withdrawToken, setWithdrawToken] = useState("")

  // Owner check is handled by parent component

  if (!isOwner) return null

  const handleSetFeeRate = async () => {
    if (!feeRate || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "setProcessingFee",
        args: [BigInt(Number(feeRate) * 100)], // Convert percentage to basis points
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `Fee rate set to ${feeRate}% for token ${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`,
      })
      setTokenAddress("")
      setFeeRate("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to set fee rate",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleSetMerchantStatus = async () => {
    if (!merchantId || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "toggleMerchant",
        args: [merchantId as `0x${string}`],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: `Merchant ${merchantId} ${merchantActive ? "activated" : "deactivated"}`,
      })
      setMerchantId("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update merchant status",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  const handleWithdrawFees = async () => {
    if (!withdrawToken || !walletClient) return
    setIsTransacting(true)
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACTS.THY_PAYMENT_GATEWAY,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: "withdrawFees",
        args: [BigInt(withdrawToken)],
        account: address as `0x${string}`,
        chain: sepolia,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast({
        title: "Success",
        description: "Fees withdrawn successfully",
      })
      setWithdrawToken("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to withdraw fees",
        variant: "destructive",
      })
    }
    setIsTransacting(false)
  }

  return (
    <Card className="bg-card border-border border-2 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-card-foreground">Payment Gateway Admin</CardTitle>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Owner Access
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          Manage payment fees and merchants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fees" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fees">Fee Management</TabsTrigger>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="fees" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="token-address" className="text-card-foreground">
                  Token Address
                </Label>
                <WalletAddressPicker 
                  onSelectAddress={(address) => setTokenAddress(address)}
                  buttonText="Use THY Token"
                />
              </div>
              <Input
                id="token-address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Set to THY Token: 0xE32B76EC0Bf09F20f9C1fa3200fFEd5E8979C6d7
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee-rate" className="text-card-foreground">
                Fee Rate (%)
              </Label>
              <Input
                id="fee-rate"
                type="number"
                step="0.1"
                placeholder="1.5"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Fee percentage charged on payments
              </p>
            </div>

            <Button
              onClick={handleSetFeeRate}
              disabled={!tokenAddress || !feeRate || isTransacting}
              className="w-full gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Set Fee Rate
            </Button>
          </TabsContent>

          <TabsContent value="merchants" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-id" className="text-card-foreground">
                Merchant ID
              </Label>
              <Input
                id="merchant-id"
                type="number"
                placeholder="1"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-card-foreground">Merchant Status</p>
                <p className="text-sm text-muted-foreground">
                  Enable or disable merchant
                </p>
              </div>
              <Switch
                checked={merchantActive}
                onCheckedChange={setMerchantActive}
              />
            </div>

            <Button
              onClick={handleSetMerchantStatus}
              disabled={!merchantId || isTransacting}
              className="w-full gap-2"
            >
              <Users className="h-4 w-4" />
              Update Merchant Status
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 space-y-2">
              <p className="text-sm font-medium text-card-foreground">Withdraw Collected Fees</p>
              <p className="text-xs text-muted-foreground">
                Withdraw all accumulated fees for a specific token
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="withdraw-token" className="text-card-foreground">
                  Token Address
                </Label>
                <WalletAddressPicker 
                  onSelectAddress={(address) => setWithdrawToken(address)}
                  buttonText="Use THY Token"
                />
              </div>
              <Input
                id="withdraw-token"
                placeholder="0x..."
                value={withdrawToken}
                onChange={(e) => setWithdrawToken(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>

            <Button
              onClick={handleWithdrawFees}
              disabled={!withdrawToken || isTransacting}
              variant="secondary"
              className="w-full gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Withdraw Fees
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}