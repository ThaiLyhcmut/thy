"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/hooks/use-wallet"
import { usePaymentGateway } from "@/hooks/use-payment-gateway"
import { Image, Download, Coins, Paintbrush, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MerchantRegistration } from "./merchant-registration"
import { PaymentTest } from "./payment-test"

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

export function ImageGenerator() {
  const { isConnected, address } = useWallet()
  const { 
    merchantInfo,
    paymentData,
    isLoading,
    error,
    PRICE_PER_IMAGE,
    createPayment,
    processPayment,
    useCredits,
    getTotalStats
  } = usePaymentGateway()
  const { toast } = useToast()
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [customText, setCustomText] = useState("")
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])

  // Vietnamese character detection
  const hasVietnameseChar = (word: string): boolean => {
    return /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(word)
  }

  // Mask word function
  const maskWord = (word: string): string => {
    if (hasVietnameseChar(word)) return word
    if (word.length <= 1) return word

    if (word.length <= 3) {
      const idx = Math.floor(Math.random() * word.length)
      return word.split("").map((ch, i) => (i === idx ? "_" : ch)).join("")
    }

    const minMask = Math.ceil(word.length * 0.5)
    const maxMask = Math.ceil(word.length * 0.7)
    const numMask = Math.min(
      Math.floor(Math.random() * (maxMask - minMask + 1)) + minMask,
      word.length - 1
    )

    let indices: number[] = []
    while (indices.length < numMask) {
      const r = Math.floor(Math.random() * word.length)
      if (
        !indices.includes(r) &&
        !indices.includes(r - 1) &&
        !indices.includes(r + 1)
      ) {
        indices.push(r)
      }
    }

    return word.split("").map((ch, i) => (indices.includes(i) ? "_" : ch)).join("")
  }

  // Mask text function
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

  // Generate image on canvas
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

  // Handle payment creation
  const handleCreatePayment = async () => {
    if (!address) return

    setIsPaying(true)
    try {
      // Calculate total phrases
      const totalPhrases = selectedPhrases.length + (customText.trim() ? 1 : 0)
      
      if (totalPhrases === 0) {
        toast({
          title: "No Content",
          description: "Please select phrases or enter custom text",
          variant: "destructive",
        })
        setIsPaying(false)
        return
      }

      const description = `Image generation for ${totalPhrases} images`
      const hash = await createPayment(totalPhrases, description)
      
      if (hash) {
        // Get the payment ID from transaction events or generate it
        const paymentId = hash // This would need to be extracted from events properly
        setPendingPaymentId(paymentId)
        toast({
          title: "Payment Created",
          description: `Payment created for ${(totalPhrases * PRICE_PER_IMAGE).toFixed(2)} THY. Please process it to complete.`,
        })
      }
    } catch (error) {
      toast({
        title: "Payment Creation Failed",
        description: String(error) || "Failed to create payment",
        variant: "destructive",
      })
    }
    setIsPaying(false)
  }

  // Handle payment processing  
  const handleProcessPayment = async () => {
    if (!address || !pendingPaymentId) return

    setIsProcessing(true)
    try {
      const hash = await processPayment(pendingPaymentId)
      
      if (hash) {
        setPendingPaymentId(null)
        toast({
          title: "Payment Processed",
          description: "Payment completed successfully! You can now generate images.",
        })
      }
    } catch (error) {
      toast({
        title: "Payment Processing Failed",
        description: String(error) || "Failed to process payment",
        variant: "destructive",
      })
    }
    setIsProcessing(false)
  }

  // Generate images
  const handleGenerate = async () => {
    const stats = getTotalStats()
    if (stats.remainingCredits <= 0) {
      toast({
        title: "No Credits",
        description: "Please make a payment first",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const textsToGenerate = [...selectedPhrases]
      if (customText.trim()) {
        textsToGenerate.push(customText.trim())
      }

      const newImages: GeneratedImage[] = []
      const maxImages = Math.min(textsToGenerate.length, stats.remainingCredits)

      for (let i = 0; i < maxImages; i++) {
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

      // Use credits for generated images
      const creditsUsed = await useCredits(newImages.length)
      if (creditsUsed) {
        setGeneratedImages(prev => [...newImages, ...prev])
        toast({
          title: "Generation Complete",
          description: `Generated ${newImages.length} images`,
        })
      } else {
        throw new Error("Failed to use credits")
      }
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

  // Debug mode - show test component
  if (process.env.NODE_ENV === "development" && !merchantInfo?.active) {
    return (
      <div className="space-y-6">
        <PaymentTest />
        <MerchantRegistration />
      </div>
    )
  }

  if (!merchantInfo?.active) {
    return <MerchantRegistration />
  }

  const totalSelected = selectedPhrases.length + (customText.trim() ? 1 : 0)
  const requiredThy = totalSelected * PRICE_PER_IMAGE
  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Vietnamese Word Puzzle Generator</h2>
        <p className="text-muted-foreground">Generate word puzzle images with masked Vietnamese text</p>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Pricing & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{PRICE_PER_IMAGE} THY</div>
              <div className="text-sm text-muted-foreground">= 1 Image</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-card-foreground">{stats.remainingCredits}</div>
              <div className="text-sm text-muted-foreground">Credits Remaining</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${stats.remainingCredits > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.remainingCredits > 0 ? <CheckCircle className="h-6 w-6 mx-auto" /> : <AlertCircle className="h-6 w-6 mx-auto" />}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.remainingCredits > 0 ? 'Credits Available' : 'Payment Required'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Selection */}
      <Tabs defaultValue="phrases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phrases">Select Phrases</TabsTrigger>
          <TabsTrigger value="custom">Custom Text</TabsTrigger>
        </TabsList>

        <TabsContent value="phrases" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Choose Vietnamese Phrases</CardTitle>
              <CardDescription className="text-muted-foreground">
                Select phrases to generate word puzzle images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {DEFAULT_PHRASES.map((phrase) => (
                  <Button
                    key={phrase}
                    variant={selectedPhrases.includes(phrase) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePhrase(phrase)}
                    className="text-left justify-start"
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
              
              {selectedPhrases.length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected ({selectedPhrases.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPhrases.map((phrase) => (
                      <Badge key={phrase} variant="secondary" className="text-xs">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Payment & Generation */}
      <div className="space-y-4">
        {totalSelected > 0 && (
          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Coins className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              <strong>Cost:</strong> {requiredThy.toFixed(2)} THY for {totalSelected} image(s)
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {!pendingPaymentId ? (
            <Button
              onClick={handleCreatePayment}
              disabled={totalSelected === 0 || isPaying || isLoading}
              className="gap-2"
            >
              <Coins className="h-4 w-4" />
              {isPaying ? "Creating Payment..." : `Create Payment ${requiredThy.toFixed(2)} THY`}
            </Button>
          ) : (
            <Button
              onClick={handleProcessPayment}
              disabled={isProcessing || isLoading}
              className="gap-2"
            >
              <Coins className="h-4 w-4" />
              {isProcessing ? "Processing..." : "Process Payment"}
            </Button>
          )}

          <Button
            onClick={handleGenerate}
            disabled={stats.remainingCredits <= 0 || isGenerating || isLoading || !!pendingPaymentId}
            variant="secondary"
            className="gap-2"
          >
            <Paintbrush className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Images"}
          </Button>
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Generated Images</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your word puzzle images - click download to save
            </CardDescription>
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