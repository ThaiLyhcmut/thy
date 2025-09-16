"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { AdminPanel } from "@/components/admin-panel"
import { LiquidityMiningAdmin } from "@/components/admin/liquidity-mining-admin"
import { StakingAdmin } from "@/components/admin/staking-admin"
import { PaymentGatewayAdmin } from "@/components/admin/payment-gateway-admin"
import { publicClient, CONTRACTS, LIQUIDITY_MINING_ABI, STAKING_ABI, PAYMENT_GATEWAY_ABI } from "@/lib/web3"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface OwnershipStatus {
  thyToken: boolean
  liquidityMining: boolean
  staking: boolean
  paymentGateway: boolean
}

export function RealAdminPanels() {
  const { address } = useWallet()
  const [ownership, setOwnership] = useState<OwnershipStatus>({
    thyToken: false,
    liquidityMining: false,
    staking: false,
    paymentGateway: false
  })
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAllOwnership = async () => {
      if (!address) {
        setIsChecking(false)
        return
      }

      setIsChecking(true)
      console.log("Checking ownership for address:", address)

      try {
        const [thyOwner, liquidityOwner, stakingOwner, paymentOwner] = await Promise.allSettled([
          // THY Token owner
          publicClient.readContract({
            address: CONTRACTS.THY_TOKEN,
            abi: [{ inputs: [], name: "owner", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" }],
            functionName: "owner",
          }),
          
          // Liquidity Mining owner
          publicClient.readContract({
            address: CONTRACTS.THY_LIQUIDITY_MINING,
            abi: LIQUIDITY_MINING_ABI,
            functionName: "owner",
          }),
          
          // Staking owner
          publicClient.readContract({
            address: CONTRACTS.THY_STAKING,
            abi: STAKING_ABI,
            functionName: "owner",
          }),
          
          // Payment Gateway owner
          publicClient.readContract({
            address: CONTRACTS.THY_PAYMENT_GATEWAY,
            abi: PAYMENT_GATEWAY_ABI,
            functionName: "owner",
          }),
        ])

        const ownershipStatus: OwnershipStatus = {
          thyToken: thyOwner.status === 'fulfilled' && thyOwner.value.toLowerCase() === address.toLowerCase(),
          liquidityMining: liquidityOwner.status === 'fulfilled' && liquidityOwner.value.toLowerCase() === address.toLowerCase(),
          staking: stakingOwner.status === 'fulfilled' && stakingOwner.value.toLowerCase() === address.toLowerCase(),
          paymentGateway: paymentOwner.status === 'fulfilled' && paymentOwner.value.toLowerCase() === address.toLowerCase(),
        }

        console.log("Ownership check results:", {
          address,
          thyOwner: thyOwner.status === 'fulfilled' ? thyOwner.value : thyOwner.reason,
          liquidityOwner: liquidityOwner.status === 'fulfilled' ? liquidityOwner.value : liquidityOwner.reason,
          stakingOwner: stakingOwner.status === 'fulfilled' ? stakingOwner.value : stakingOwner.reason,
          paymentOwner: paymentOwner.status === 'fulfilled' ? paymentOwner.value : paymentOwner.reason,
          ownershipStatus
        })

        setOwnership(ownershipStatus)
      } catch (error) {
        console.error("Error checking ownership:", error)
      }
      
      setIsChecking(false)
    }

    checkAllOwnership()
  }, [address])

  if (isChecking) {
    return (
      <Alert className="border-blue-500/20 bg-blue-500/5">
        <AlertCircle className="h-4 w-4 text-blue-500 animate-pulse" />
        <AlertDescription className="text-blue-700">
          Checking contract ownership status...
        </AlertDescription>
      </Alert>
    )
  }

  const totalOwned = Object.values(ownership).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Ownership Status */}
      <Alert className={totalOwned > 0 ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}>
        <CheckCircle className={`h-4 w-4 ${totalOwned > 0 ? "text-green-500" : "text-yellow-500"}`} />
        <AlertDescription className={totalOwned > 0 ? "text-green-700" : "text-yellow-700"}>
          <strong>Ownership Status:</strong> You own {totalOwned} out of 4 contracts.
          {totalOwned === 0 && " No admin privileges detected."}
        </AlertDescription>
      </Alert>

      {/* Contract Ownership Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border ${ownership.thyToken ? 'border-green-500/20 bg-green-500/5' : 'border-gray-500/20 bg-gray-500/5'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${ownership.thyToken ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium">THY Token</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {ownership.thyToken ? 'You are the owner' : 'Not owner'}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border ${ownership.liquidityMining ? 'border-green-500/20 bg-green-500/5' : 'border-gray-500/20 bg-gray-500/5'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${ownership.liquidityMining ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium">Liquidity Mining</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {ownership.liquidityMining ? 'You are the owner' : 'Not owner'}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border ${ownership.staking ? 'border-green-500/20 bg-green-500/5' : 'border-gray-500/20 bg-gray-500/5'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${ownership.staking ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium">Staking</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {ownership.staking ? 'You are the owner' : 'Not owner'}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border ${ownership.paymentGateway ? 'border-green-500/20 bg-green-500/5' : 'border-gray-500/20 bg-gray-500/5'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${ownership.paymentGateway ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium">Payment Gateway</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {ownership.paymentGateway ? 'You are the owner' : 'Not owner'}
          </p>
        </div>
      </div>

      {/* Admin Panels */}
      {ownership.thyToken && (
        <AdminPanel />
      )}

      {ownership.liquidityMining && (
        <div>
          <LiquidityMiningAdmin />
        </div>
      )}

      {ownership.staking && (
        <div>
          <StakingAdmin />
        </div>
      )}

      {ownership.paymentGateway && (
        <div>
          <PaymentGatewayAdmin />
        </div>
      )}

      {totalOwned === 0 && (
        <Alert className="border-gray-500/20 bg-gray-500/5">
          <AlertCircle className="h-4 w-4 text-gray-500" />
          <AlertDescription className="text-gray-700">
            No admin panels available. You need to be the owner of contracts to access admin functions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}