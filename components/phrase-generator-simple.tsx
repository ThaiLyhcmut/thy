"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCohere } from "@/hooks/use-cohere"
import { 
  Sparkles, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  Download, 
  Wand2, 
  AlertCircle,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PhraseGeneratorProps {
  selectedPhrases: string[]
  onPhrasesChange: (phrases: string[]) => void
  onDownloadAll?: () => void
}

const CATEGORIES = [
  { value: 'greetings', label: 'Chào hỏi & Lịch sự' },
  { value: 'family', label: 'Gia đình & Mối quan hệ' },
  { value: 'food', label: 'Món ăn & Nấu nướng' },
  { value: 'travel', label: 'Du lịch & Di chuyển' },
  { value: 'work', label: 'Công việc & Kinh doanh' }
]

export function PhraseGeneratorSimple({ selectedPhrases, onPhrasesChange, onDownloadAll }: PhraseGeneratorProps) {
  const { 
    phrases, 
    isLoading, 
    error, 
    generateVietnamesePhrases,
    generateByCategory 
  } = useCohere()
  
  const { toast } = useToast()
  
  const [selectedCategory, setSelectedCategory] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!selectedCategory && !customTopic.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a category or enter a custom topic",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      if (customTopic.trim()) {
        await generateVietnamesePhrases(customTopic, 50)
        toast({
          title: "AI Phrases Generated!",
          description: `Generated phrases for "${customTopic}"`,
        })
      } else if (selectedCategory) {
        await generateByCategory(selectedCategory)
        const categoryLabel = CATEGORIES.find(c => c.value === selectedCategory)?.label
        toast({
          title: "AI Phrases Generated!",
          description: `Generated phrases for ${categoryLabel}`,
        })
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate phrases. Please try again.",
        variant: "destructive",
      })
    }

    setIsGenerating(false)
  }

  const handleSelectPhrase = (phrase: string) => {
    if (selectedPhrases.includes(phrase)) {
      onPhrasesChange(selectedPhrases.filter(p => p !== phrase))
    } else {
      onPhrasesChange([...selectedPhrases, phrase])
    }
  }

  const handleSelectAll = () => {
    if (selectedPhrases.length === phrases.length && phrases.length > 0) {
      onPhrasesChange([])
      toast({ title: "Deselected All", description: "All phrases deselected" })
    } else {
      onPhrasesChange([...phrases])
      toast({ title: "Selected All", description: `Selected ${phrases.length} phrases` })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Phrase Generator
          </CardTitle>
          <CardDescription>
            Generate Vietnamese phrases using AI for word puzzles
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Category</Label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose a category...</option>
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Or Custom Topic</Label>
              <Input
                placeholder="Enter your own topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || isGenerating || (!selectedCategory && !customTopic.trim())}
              className="gap-2"
            >
              {isLoading || isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isLoading || isGenerating ? "Generating..." : "Generate Phrases"}
            </Button>

            {phrases.length > 0 && (
              <Button
                onClick={() => handleGenerate()}
                disabled={isLoading || isGenerating}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {phrases.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Phrases ({phrases.length})</CardTitle>
                <CardDescription>
                  Select phrases to include in your image generation
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedPhrases.length === phrases.length ? "Deselect All" : "Select All"}
                </Button>

                {onDownloadAll && selectedPhrases.length > 0 && (
                  <Button onClick={onDownloadAll} size="sm">
                    Download All ({selectedPhrases.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {phrases.map((phrase, index) => {
                const isSelected = selectedPhrases.includes(phrase)
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectPhrase(phrase)}
                    className="text-left justify-start"
                  >
                    {phrase}
                  </Button>
                )
              })}
            </div>
            
            {selectedPhrases.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Selected Phrases ({selectedPhrases.length}):
                </p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {selectedPhrases.map((phrase, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>No phrases generated yet. Select a category or enter a topic to generate phrases.</p>
          <p className="text-xs mt-2">Debug: phrases.length = {phrases.length}</p>
        </div>
      )}
    </div>
  )
}