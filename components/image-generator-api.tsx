"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/hooks/use-wallet"
import { usePaymentApi, type PaymentRequest } from "@/hooks/use-payment-api"
import { Image, Download, Coins, Paintbrush, AlertCircle, CheckCircle, Clock, History, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PhraseGeneratorSimple } from "./phrase-generator-simple"

// PaymentRequest type is imported from the usePaymentApi hook

interface GeneratedImage {
  id: string
  originalText: string
  maskedText: string
  dataUrl: string
  timestamp: string
}

const DEFAULT_PHRASES = [
  "Xin chào bạn",
  "Hẹn gặp lại", 
  "Chúc bạn một ngày tốt lành",
  "Tôi đang học lập trình",
  "Trời hôm nay thật đẹp",
  "Bạn có khỏe không",
  "Chúng ta cùng đi ăn trưa",
  "Cuộc sống là những chuyến đi",
  "Gia đình là số một",
  "Thành công đến từ nỗ lực",
  "Cà phê sữa đá buổi sáng",
  "Hạnh phúc giản đơn",
  "Thời gian quý hơn vàng",
  "Tình bạn mãi mãi",
  "Ước mơ không bao giờ tắt",
  "Sách là kho tàng tri thức",
  "Mỗi ngày một niềm vui",
  "Nụ cười tỏa nắng",
  "Học tập suốt đời",
  "Vượt qua thử thách"
]

interface ImageGeneratorApiProps {
  selectedWords?: string[]
}

export function ImageGeneratorApi({ selectedWords = [] }: ImageGeneratorApiProps) {
  const { isConnected, address } = useWallet()
  const {
    isLoading,
    error,
    currentPayment,
    allowanceStatus,
    currentAllowance,
    PRICE_PER_IMAGE,
    checkAllowance,
    approveThyToken,
    createPaymentRequest,
    processPaymentOnChain,
    submitTransactionHash,
    getPaymentStats,
    spendPointsForImages,
    getAllPayments,
    clearCurrentPayment,
    setSelectedPayment
  } = usePaymentApi()
  const { toast } = useToast()
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [customText, setCustomText] = useState("")
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [paymentStep, setPaymentStep] = useState<'select' | 'paying' | 'pending-payment' | 'completed'>('select')
  const [walletStats, setWalletStats] = useState({
    totalPoints: 0,
    availableCredits: 0,
    totalSpentTHY: "0",
    loading: true
  })
  const [buyAmount, setBuyAmount] = useState("1.0") // THY amount to buy
  const [paymentHistory, setPaymentHistory] = useState<PaymentRequest[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Auto-select words from Word Generator
  useEffect(() => {
    if (selectedWords.length > 0) {
      setSelectedPhrases(selectedWords)
      toast({
        title: "Từ vựng đã được tải!",
        description: `Đã thêm ${selectedWords.length} từ vào danh sách tạo hình ảnh`,
      })
    }
  }, [selectedWords, toast])

  // Check allowance and wallet points when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkAllowance()
      loadWalletStats()
      loadPaymentHistory()
    }
  }, [isConnected, address, checkAllowance])

  // Load wallet points/stats
  const loadWalletStats = async () => {
    setWalletStats(prev => ({ ...prev, loading: true }))

    try {
      const stats = await getPaymentStats()
      setWalletStats({
        totalPoints: stats.totalPoints || 0,
        availableCredits: stats.availableCredits || 0,
        totalSpentTHY: stats.totalPaid || "0",
        loading: false
      })
    } catch (error) {
      console.error('Failed to load wallet stats:', error)
      setWalletStats({
        totalPoints: 0,
        availableCredits: 0,
        totalSpentTHY: "0",
        loading: false
      })
    }
  }

  // Load payment history
  const loadPaymentHistory = async () => {
    if (!address) return

    setHistoryLoading(true)
    try {
      const payments = await getAllPayments()
      setPaymentHistory(payments)
    } catch (error) {
      console.error('Failed to load payment history:', error)
      toast({
        title: "Failed to load payment history",
        description: "Could not fetch payment history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  // Vietnamese character detection
  const hasVietnameseChar = (word: string): boolean => {
    return /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(word)
  }

  // Mask text function (same as before)
  const maskText = (input: string): string => {
    const words = input.split(" ")
    const totalChars = words.join("").length

    const minMask = Math.ceil(totalChars * 0.3)
    const maxMask = Math.ceil(totalChars * 0.5)
    const numMask = Math.floor(Math.random() * (maxMask - minMask + 1)) + minMask

    let positions: { wi: number; ci: number }[] = []
    words.forEach((w, wi) => {
      w.split("").forEach((_, ci) => {
        positions.push({ wi, ci })
      })
    })

    let chosen: { wi: number; ci: number }[] = []
    while (chosen.length < numMask && positions.length > 0) {
      const r = Math.floor(Math.random() * positions.length)
      const pos = positions[r]

      if (!chosen.some(p => p.wi === pos.wi && Math.abs(p.ci - pos.ci) <= 1)) {
        chosen.push(pos)
      }
      positions.splice(r, 1)
    }

    words.forEach((w, wi) => {
      if (!chosen.some(p => p.wi === wi)) {
        const idx = Math.floor(Math.random() * w.length)
        chosen.push({ wi, ci: idx })
      }
    })

    const maskedWords = words.map((w, wi) => {
      return w.split("").map((ch, ci) =>
        chosen.some(p => p.wi === wi && p.ci === ci) ? "_" : ch
      ).join("")
    })

    return maskedWords.join(" ")
  }

  // Generate image on canvas (same as before)
  const generateImageOnCanvas = (maskedText: string, originalText: string): string => {
    const canvas = canvasRef.current
    if (!canvas) return ""

    const ctx = canvas.getContext("2d")
    if (!ctx) return ""

    const width = 600
    const height = 400
    canvas.width = width
    canvas.height = height

    // Black background
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, width, height)

    // Main text
    ctx.fillStyle = "white"
    ctx.font = "48px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(maskedText, width / 2, height / 2 - 30)

    // Answer text
    ctx.font = "28px Arial"
    ctx.fillText(originalText, width / 2, height - 60)

    return canvas.toDataURL("image/png")
  }

  // Handle THY approval
  const handleApproval = async () => {
    const totalPhrases = selectedPhrases.length + (customText.trim() ? 1 : 0)
    const totalAmount = totalPhrases * PRICE_PER_IMAGE

    const success = await approveThyToken(totalAmount)
    if (success) {
      toast({
        title: "Approval Successful!",
        description: `Approved ${totalAmount} THY for payments`,
      })
    } else {
      toast({
        title: "Approval Failed",
        description: error || "Failed to approve THY tokens",
        variant: "destructive",
      })
    }
  }

  // Handle create payment for buying credits
  const handleCreatePayment = async () => {
    if (!address) return

    const thyAmount = parseFloat(buyAmount)
    if (isNaN(thyAmount) || thyAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid THY amount",
        variant: "destructive",
      })
      return
    }

    setPaymentStep('paying')

    // Calculate expected points (1 THY = 100 points as per backend logic)
    const expectedPoints = Math.floor(thyAmount * 100)
    const description = `Buy ${expectedPoints} credits with ${thyAmount} THY`

    // Create payment request with THY amount (backend expects images count, so we convert)
    const imageEquivalent = Math.floor(thyAmount / PRICE_PER_IMAGE)
    const paymentRequest = await createPaymentRequest(imageEquivalent, description)

    if (paymentRequest) {
      toast({
        title: "Payment Created!",
        description: `Payment created for ${thyAmount} THY → ${expectedPoints} credits. Checking approval...`,
      })

      // Immediately check allowance and approve if needed
      const allowanceOk = await checkAllowance(thyAmount)
      if (!allowanceOk && allowanceStatus === 'insufficient') {
        toast({
          title: "Approving THY...",
          description: `Approving ${thyAmount} THY for payment`,
        })

        const approvalSuccess = await approveThyToken(thyAmount)
        if (!approvalSuccess) {
          setPaymentStep('select')
          toast({
            title: "Approval Failed",
            description: error || "Failed to approve THY tokens. Please try again.",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Approval Successful!",
          description: `Approved ${thyAmount} THY. Ready for payment.`,
        })
      }

      setPaymentStep('pending-payment')
    } else {
      setPaymentStep('select')
      toast({
        title: "Payment Creation Failed",
        description: error || "Failed to create payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle resume payment from history
  const handleResumePayment = async (payment: PaymentRequest) => {
    // Set the selected payment as current payment
    setSelectedPayment(payment)
    setPaymentStep('pending-payment')

    toast({
      title: "Payment Resumed",
      description: `Resuming payment for ${payment.amount} THY → ${Math.floor(payment.amount * 100)} credits`,
    })

    // Check allowance and approve if needed
    const paymentAmountTHY = parseFloat(payment.amount.toString())
    const allowanceOk = await checkAllowance(paymentAmountTHY)
    if (!allowanceOk && allowanceStatus === 'insufficient') {
      toast({
        title: "Approval Required",
        description: `Please approve ${paymentAmountTHY} THY to continue with this payment`,
      })

      const approvalSuccess = await approveThyToken(paymentAmountTHY)
      if (!approvalSuccess) {
        toast({
          title: "Approval Failed",
          description: error || "Failed to approve THY tokens. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Approval Successful!",
        description: `Approved ${payment.amount} THY. You can now complete the payment.`,
      })
    }
  }

  // Handle blockchain payment (step 2)
  const handleBlockchainPayment = async () => {
    if (!currentPayment || !address) return

    const totalAmount = parseFloat(currentPayment.amount.toString())

    // Re-check allowance to ensure it's still sufficient
    const allowanceOk = await checkAllowance(totalAmount)
    if (allowanceOk) {
      console.log(`Allowance check passed for ${totalAmount} THY`)
    } else {
      console.log(`Allowance check failed. Current status: ${allowanceStatus}`)
      // If allowance check fails but we already approved, try to proceed anyway
      // as the smart contract will do its own check
    }

    setPaymentStep('paying')

    // Process blockchain payment (will check allowance internally)
    const transactionHash = await processPaymentOnChain(currentPayment)
    if (transactionHash) {
      // Submit transaction hash to backend for automatic monitoring
      const blockchainPaymentId = currentPayment.blockchainPaymentId || currentPayment.paymentId || ''
      const submitted = await submitTransactionHash(transactionHash, blockchainPaymentId)

      if (submitted) {
        setPaymentStep('completed')
        toast({
          title: "Payment Processing!",
          description: `Transaction submitted successfully. Backend is monitoring automatically.`,
        })

        // Reload wallet stats and payment history
        await loadWalletStats()
        await loadPaymentHistory()

        // Show monitoring message
        toast({
          title: "Monitoring in Progress",
          description: `Your payment is being processed. Status will update automatically.`,
        })
      } else {
        setPaymentStep('pending-payment')
        toast({
          title: "Payment Verification Failed",
          description: "Payment processed but verification failed. Please contact support.",
          variant: "destructive",
        })
      }
    } else {
      setPaymentStep('pending-payment')
      toast({
        title: "Blockchain Payment Failed",
        description: error || "Blockchain payment failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Generate images using points system
  const handleGenerate = async () => {
    if (walletStats.availableCredits <= 0) {
      toast({
        title: "No Credits",
        description: "Please buy credits first",
        variant: "destructive",
      })
      return
    }

    const textsToGenerate = [...selectedPhrases]
    if (customText.trim()) {
      textsToGenerate.push(customText.trim())
    }

    const imageCount = textsToGenerate.length
    if (imageCount > walletStats.availableCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${imageCount} credits but only have ${walletStats.availableCredits}`,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Spend points first
      const pointsSpent = await spendPointsForImages(imageCount)
      if (!pointsSpent) {
        throw new Error("Failed to spend points")
      }

      const newImages: GeneratedImage[] = []

      for (let i = 0; i < imageCount; i++) {
        const text = textsToGenerate[i]
        const maskedText = maskText(text)
        const dataUrl = generateImageOnCanvas(maskedText, text)

        if (dataUrl) {
          newImages.push({
            id: Date.now().toString() + Math.random(),
            originalText: text,
            maskedText,
            dataUrl,
            timestamp: new Date().toLocaleString()
          })
        }

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setGeneratedImages(prev => [...newImages, ...prev])

      // Reload wallet stats to show updated credits
      await loadWalletStats()

      toast({
        title: "Generation Complete",
        description: `Generated ${newImages.length} images! Spent ${imageCount} credits.`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate images",
        variant: "destructive",
      })
    }

    setIsGenerating(false)
  }

  // Download image
  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement("a")
    link.download = `word-puzzle-${image.id}.png`
    link.href = image.dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download Started",
      description: "Image download started",
    })
  }

  // Download all images
  const downloadAllImages = useCallback(async () => {
    if (generatedImages.length === 0) {
      toast({
        title: "No Images",
        description: "No images available to download",
        variant: "destructive",
      })
      return
    }

    try {
      // Download each image with a delay
      for (let i = 0; i < generatedImages.length; i++) {
        const image = generatedImages[i]
        const link = document.createElement("a")
        link.download = `word-puzzle-${i + 1}-${image.id}.png`
        link.href = image.dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Small delay between downloads
        if (i < generatedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      toast({
        title: "Download All Complete",
        description: `Downloaded ${generatedImages.length} images successfully!`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download some images",
        variant: "destructive",
      })
    }
  }, [generatedImages, toast])

  // Generate all selected phrases automatically
  const generateAllFromPhrases = useCallback(async () => {
    if (selectedPhrases.length === 0) {
      toast({
        title: "No Phrases Selected",
        description: "Please select phrases to generate images",
        variant: "destructive",
      })
      return
    }

    const stats = getPaymentStats()
    if (stats.availableCredits < selectedPhrases.length) {
      toast({
        title: "Insufficient Credits", 
        description: `You need ${selectedPhrases.length} credits but only have ${stats.availableCredits}`,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const newImages: GeneratedImage[] = []

      for (let i = 0; i < selectedPhrases.length; i++) {
        const text = selectedPhrases[i]
        const maskedText = maskText(text)
        const dataUrl = generateImageOnCanvas(maskedText, text)
        
        if (dataUrl) {
          newImages.push({
            id: Date.now().toString() + Math.random(),
            originalText: text,
            maskedText,
            dataUrl,
            timestamp: new Date().toLocaleString()
          })
        }

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      setGeneratedImages(prev => [...newImages, ...prev])
      
      toast({
        title: "Generation Complete",
        description: `Generated ${newImages.length} images from selected phrases!`,
      })

      // Auto download all after generation
      setTimeout(() => {
        downloadAllImages()
      }, 1000)

    } catch (error) {
      toast({
        title: "Generation Failed", 
        description: "Failed to generate images",
        variant: "destructive",
      })
    }

    setIsGenerating(false)
  }, [selectedPhrases, getPaymentStats, maskText, generateImageOnCanvas, downloadAllImages, toast])

  // Handle phrase selection
  const togglePhrase = (phrase: string) => {
    setSelectedPhrases(prev => 
      prev.includes(phrase)
        ? prev.filter(p => p !== phrase)
        : [...prev, phrase]
    )
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Image className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-card-foreground">Connect Your Wallet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please connect your wallet to access the image generator
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalSelected = selectedPhrases.length + (customText.trim() ? 1 : 0)
  const requiredThy = totalSelected * PRICE_PER_IMAGE
  const stats = getPaymentStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Vietnamese Word Puzzle Generator</h2>
        <p className="text-muted-foreground">Generate word puzzle images with API payment system</p>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Allowance Status */}
      {isConnected && allowanceStatus !== 'checking' && (
        <Alert className={`border-${allowanceStatus === 'sufficient' ? 'green' : allowanceStatus === 'insufficient' ? 'yellow' : 'red'}-500/20 bg-${allowanceStatus === 'sufficient' ? 'green' : allowanceStatus === 'insufficient' ? 'yellow' : 'red'}-500/5`}>
          {allowanceStatus === 'sufficient' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : allowanceStatus === 'insufficient' ? (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={`text-${allowanceStatus === 'sufficient' ? 'green' : allowanceStatus === 'insufficient' ? 'yellow' : 'red'}-700`}>
            <strong>THY Allowance:</strong> {
              allowanceStatus === 'sufficient' ? '✅ Ready for payments' :
              allowanceStatus === 'insufficient' ? '⚠️ Approval required before payment' :
              '❌ Error checking allowance'
            }
            {allowanceStatus === 'insufficient' && (
              <span className="block mt-1 text-sm">
                Current allowance: {(Number(currentAllowance) / 1e18).toFixed(4)} THY
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Status */}
      {currentPayment && (
        <Alert className={`border-${currentPayment.status === 'completed' ? 'green' : 'blue'}-500/20 bg-${currentPayment.status === 'completed' ? 'green' : 'blue'}-500/5`}>
          <CheckCircle className={`h-4 w-4 text-${currentPayment.status === 'completed' ? 'green' : 'blue'}-500`} />
          <AlertDescription className={`text-${currentPayment.status === 'completed' ? 'green' : 'blue'}-700`}>
            <strong>Payment Status:</strong> {currentPayment.status}
            {currentPayment.status === 'completed' && (
              <span className="ml-2">✅ Ready to generate images!</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Imported Words Alert */}
      {selectedWords.length > 0 && (
        <Alert className="border-green-500/20 bg-green-500/5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            <strong>Đã nhập {selectedWords.length} từ vựng</strong> từ Word Generator!
            Các từ đã được thêm vào danh sách để tạo hình ảnh.
          </AlertDescription>
        </Alert>
      )}

      {/* Buy Credits Section - Top Priority */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Buy Credits
            </CardTitle>
            <CardDescription className="text-blue-700">
              Purchase credits to generate unlimited images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/70 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{walletStats.loading ? "..." : walletStats.availableCredits}</div>
                    <div className="text-sm text-blue-500">Available Credits</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{walletStats.loading ? "..." : walletStats.totalPoints}</div>
                    <div className="text-sm text-green-500">Total Earned</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{PRICE_PER_IMAGE} THY</div>
                    <div className="text-sm text-purple-500">= 1 Credit</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Refresh Credits Button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadWalletStats}
                disabled={walletStats.loading}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${walletStats.loading ? 'animate-spin' : ''}`} />
                Refresh Credits
              </Button>
            </div>

            {/* Buy Credits Input & Actions */}
            <div className="space-y-4 pt-4 border-t border-blue-200">
              {/* Input THY amount */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="buy-amount" className="text-blue-800 font-medium">
                    Enter THY Amount to Buy Credits
                  </Label>
                  <Input
                    id="buy-amount"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="1.0"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="mt-1 bg-white border-blue-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-medium">Expected Credits</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {isNaN(parseFloat(buyAmount)) ? "0" : Math.floor(parseFloat(buyAmount) * 100)}
                  </div>
                  <div className="text-xs text-blue-500">1 THY = 100 credits</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {/* Step 1: Create Payment */}
                <Button
                  onClick={handleCreatePayment}
                  disabled={isLoading || paymentStep !== 'select' || !buyAmount || parseFloat(buyAmount) <= 0}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Coins className="h-4 w-4" />
                  {paymentStep === 'paying' ? "Creating Payment..." : `Buy ${buyAmount} THY Credits`}
                </Button>

                {/* Step 2: Approve (if needed) */}
                {paymentStep === 'pending-payment' && allowanceStatus === 'insufficient' && (
                  <Button
                    onClick={handleApproval}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isLoading ? "Approving..." : `Approve ${buyAmount} THY`}
                  </Button>
                )}

                {/* Step 3: Pay Now */}
                {paymentStep === 'pending-payment' && (
                  <Button
                    onClick={handleBlockchainPayment}
                    disabled={isLoading || allowanceStatus === 'insufficient'}
                    variant="default"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Coins className="h-4 w-4" />
                    {paymentStep === 'paying' ? "Processing..." : "Pay Now"}
                  </Button>
                )}

                {/* Reset */}
                {currentPayment && (
                  <Button
                    onClick={clearCurrentPayment}
                    variant="outline"
                    size="sm"
                  >
                    New Payment
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payment History Section */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <History className="h-5 w-5" />
              Payment History
              <Button
                onClick={loadPaymentHistory}
                disabled={historyLoading}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
            <CardDescription className="text-orange-700">
              View and resume pending payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {historyLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <p className="text-orange-600 mt-2">Loading payment history...</p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-4 text-orange-600">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No payment history found</p>
                <p className="text-sm text-orange-500">Create your first payment above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <Card key={payment.id} className="bg-white/70 border-orange-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={payment.status === 'pending' ? 'outline' :
                                      payment.status === 'completed' ? 'default' :
                                      'destructive'}
                              className={payment.status === 'pending' ? 'border-yellow-500 text-yellow-700' :
                                        payment.status === 'completed' ? 'bg-green-500' :
                                        'bg-red-500'}
                            >
                              {payment.status}
                            </Badge>
                            <span className="font-medium text-gray-900">
                              {payment.amount} THY
                            </span>
                            <span className="text-sm text-gray-500">
                              → {Math.floor(payment.amount * 100)} credits
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {payment.metadata.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created: {new Date(payment.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {payment.status === 'pending' && (
                          <Button
                            onClick={() => handleResumePayment(payment)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="border-orange-500 text-orange-700 hover:bg-orange-50"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Resume Payment
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Selection with AI Generator */}
      <Tabs defaultValue="ai-generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-generator">AI Phrase Generator</TabsTrigger>
          <TabsTrigger value="custom">Custom Text</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generator" className="space-y-4">
          <PhraseGeneratorSimple
            selectedPhrases={selectedPhrases}
            onPhrasesChange={setSelectedPhrases}
            onDownloadAll={generateAllFromPhrases}
          />
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Custom Vietnamese Text</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your own Vietnamese text to generate puzzle image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-text" className="text-card-foreground">
                  Vietnamese Text
                </Label>
                <Input
                  id="custom-text"
                  placeholder="Enter Vietnamese text..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Images Section */}
      <div className="space-y-4">
        {totalSelected > 0 && (
          <Alert className="border-green-500/20 bg-green-500/5">
            <Paintbrush className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              <strong>Ready to generate:</strong> {totalSelected} image(s) using {totalSelected} credits
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 flex-wrap">
          {/* Generate Images - Main Action */}
          <Button
            onClick={handleGenerate}
            disabled={walletStats.availableCredits <= 0 || isGenerating || isLoading || totalSelected === 0}
            variant="default"
            className="gap-2 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Paintbrush className="h-4 w-4" />
            {isGenerating ? "Generating..." :
             walletStats.availableCredits <= 0 ? "No Credits Available" :
             `Generate ${totalSelected} Images`}
          </Button>

          {walletStats.availableCredits <= 0 && (
            <div className="text-sm text-muted-foreground flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Buy credits above to start generating images
            </div>
          )}
        </div>
      </div>

      {/* Generated Images - Same as before */}
      {generatedImages.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Generated Images</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your word puzzle images - click download to save
                </CardDescription>
              </div>
              <Button
                onClick={downloadAllImages}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All ({generatedImages.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((image) => (
                <div key={image.id} className="space-y-2">
                  <img 
                    src={image.dataUrl} 
                    alt="Generated puzzle" 
                    className="w-full border rounded-lg"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {image.timestamp}
                    </div>
                    <Button
                      onClick={() => downloadImage(image)}
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Original: "{image.originalText}"
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}