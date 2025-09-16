"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Gamepad2, Shuffle, Copy, Download, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Categories với mô tả tiếng Việt
const CATEGORIES = {
  provinces: { name: "63 Tỉnh Thành", desc: "Tỉnh thành Việt Nam", icon: "🏛️" },
  landmarks: { name: "Địa Danh", desc: "Địa danh nổi tiếng VN", icon: "🏰" },
  food: { name: "Đồ Ăn", desc: "Món ăn, thức uống VN", icon: "🍜" },
  reduplicated: { name: "Từ Láy", desc: "Từ láy tiếng Việt", icon: "🔄" },
  compound: { name: "Từ Ghép", desc: "Từ ghép phổ biến", icon: "🧩" },
  animals: { name: "Động Vật", desc: "Con vật quen thuộc", icon: "🐕" },
  colors: { name: "Màu Sắc", desc: "Các màu cơ bản", icon: "🎨" },
  jobs: { name: "Nghề Nghiệp", desc: "Các nghề phổ biến", icon: "👨‍💼" },
  family: { name: "Gia Đình", desc: "Người thân trong nhà", icon: "👨‍👩‍👧‍👦" },
  school: { name: "Trường Học", desc: "Từ vựng học tập", icon: "🎓" },
  sports: { name: "Thể Thao", desc: "Các môn thể thao", icon: "⚽" },
  nature: { name: "Thiên Nhiên", desc: "Tự nhiên, thời tiết", icon: "🌳" },
  transport: { name: "Phương Tiện", desc: "Các loại xe, tàu", icon: "🚗" },
  body: { name: "Cơ Thể", desc: "Bộ phận cơ thể", icon: "👤" },
  emotions: { name: "Cảm Xúc", desc: "Tình cảm, cảm xúc", icon: "😊" },
  weather: { name: "Thời Tiết", desc: "Thời tiết, khí hậu", icon: "🌤️" },
  items: { name: "Đồ Dùng", desc: "Vật dụng hàng ngày", icon: "📝" },
  all: { name: "Tất Cả", desc: "Trộn tất cả chủ đề", icon: "🎲" }
}

interface MinigameWordGeneratorProps {
  onWordsSelected?: (words: string[]) => void
}

export function MinigameWordGenerator({ onWordsSelected }: MinigameWordGeneratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [count, setCount] = useState<number>(50)
  const [difficulty, setDifficulty] = useState<string>("mixed")
  const [words, setWords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [useCohere, setUseCohere] = useState<boolean>(false)
  const { toast } = useToast()

  const generateWords = async () => {
    setIsLoading(true)
    try {
      if (useCohere && customPrompt.trim()) {
        // Sử dụng Cohere API với custom prompt
        const response = await fetch('/api/cohere/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: customPrompt,
            max_tokens: 500,
            temperature: 0.8
          })
        })

        const data = await response.json()
        const generatedWords = data.text
          .split('\n')
          .map((word: string) => word.trim())
          .filter((word: string) => word && !word.match(/^\d+\./) && !word.startsWith('-'))
          .slice(0, count)

        setWords(generatedWords)
      } else {
        // Sử dụng API có sẵn
        const response = await fetch(`/api/minigame-words?category=${selectedCategory}&count=${count}&difficulty=${difficulty}`)
        const data = await response.json()

        if (data.success) {
          setWords(data.words)
          toast({
            title: "Thành công!",
            description: `Đã tạo ${data.words.length} từ vựng`,
          })
        } else {
          throw new Error(data.error)
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo từ vựng",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyWords = async () => {
    const wordsList = words.join('\n')
    await navigator.clipboard.writeText(wordsList)
    toast({
      title: "Đã copy!",
      description: "Đã sao chép danh sách từ vựng",
    })
  }

  const downloadWords = () => {
    const wordsList = words.join('\n')
    const blob = new Blob([wordsList], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `minigame-words-${selectedCategory}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Đã tải xuống!",
      description: "File từ vựng đã được lưu",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Tạo Từ Vựng Minigame
          </CardTitle>
          <CardDescription>
            Tạo từ vựng tiếng Việt cho các minigame, word puzzle và trò chơi từ vựng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Chọn Chủ Đề Nhanh:</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="justify-start text-left h-auto p-3"
                >
                  <span className="mr-2">{category.icon}</span>
                  <div>
                    <div className="font-medium text-xs">{category.name}</div>
                    <div className="text-xs opacity-70">{category.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="count">Số lượng từ</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 50)}
              />
            </div>

            <div className="space-y-2">
              <Label>Độ khó</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ (≤6 ký tự)</SelectItem>
                  <SelectItem value="medium">Trung bình (7-10 ký tự)</SelectItem>
                  <SelectItem value="hard">Khó (>10 ký tự)</SelectItem>
                  <SelectItem value="mixed">Hỗn hợp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Phương thức</Label>
              <Select value={useCohere ? "cohere" : "preset"} onValueChange={(value) => setUseCohere(value === "cohere")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preset">Từ có sẵn</SelectItem>
                  <SelectItem value="cohere">AI Cohere</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Prompt for Cohere */}
          {useCohere && (
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt tùy chỉnh (cho AI):</Label>
              <Textarea
                id="prompt"
                placeholder="Ví dụ: Tạo 50 từ vựng về động vật hoang dã ở Việt Nam..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateWords}
            disabled={isLoading || (useCohere && !customPrompt.trim())}
            className="w-full"
            size="lg"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            {isLoading ? "Đang tạo..." : "Tạo Từ Vựng"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {words.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Kết Quả ({words.length} từ)</CardTitle>
              <CardDescription>
                Chủ đề: {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name} |
                Độ khó: {difficulty === "mixed" ? "Hỗn hợp" : difficulty === "easy" ? "Dễ" : difficulty === "medium" ? "Trung bình" : "Khó"}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {onWordsSelected && (
                <Button
                  size="sm"
                  onClick={() => onWordsSelected(words)}
                  className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600"
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Tạo Hình Ảnh
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={copyWords}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadWords}>
                <Download className="h-4 w-4 mr-1" />
                Tải xuống
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {words.map((word, index) => (
                <Badge key={index} variant="secondary" className="text-center justify-center py-2">
                  {word}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}