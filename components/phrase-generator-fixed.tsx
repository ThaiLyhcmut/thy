"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import * as Select from "@radix-ui/react-select"
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
  Loader2,
  ChevronDown,
  Check
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
  { value: 'work', label: 'Công việc & Kinh doanh' },
  { value: 'emotions', label: 'Cảm xúc & Tình cảm' },
  { value: 'weather', label: 'Thời tiết & Thiên nhiên' },
  { value: 'hobbies', label: 'Sở thích & Hoạt động' },
  { value: 'education', label: 'Giáo dục & Học tập' },
  { value: 'health', label: 'Sức khỏe & Chăm sóc' }
]

export function PhraseGeneratorFixed({ selectedPhrases, onPhrasesChange, onDownloadAll }: PhraseGeneratorProps) {
  const { 
    phrases, 
    isLoading, 
    error, 
    generateVietnamesePhrases,
    generateByCategory, 
    generateMockPhrases,
    clearPhrases 
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
      let generatedPhrases: string[] = []
      
      if (customTopic.trim()) {
        generatedPhrases = await generateVietnamesePhrases(customTopic, 50)
        toast({
          title: "AI Phrases Generated!",
          description: `Generated ${generatedPhrases.length} phrases for "${customTopic}"`,
        })
      } else if (selectedCategory) {
        generatedPhrases = await generateByCategory(selectedCategory)
        const categoryLabel = CATEGORIES.find(c => c.value === selectedCategory)?.label
        toast({
          title: "AI Phrases Generated!",
          description: `Generated ${generatedPhrases.length} phrases for ${categoryLabel}`,
        })
      }

      console.log("Generated phrases:", generatedPhrases)
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
      toast({
        title: "Deselected All",
        description: "All phrases have been deselected",
      })
    } else {
      onPhrasesChange([...phrases])
      toast({
        title: "Selected All",
        description: `Selected all ${phrases.length} generated phrases`,
      })
    }
  }

  const handleRefresh = async () => {
    if (selectedCategory || customTopic.trim()) {
      await handleGenerate()
    }
  }

  const allSelected = phrases.length > 0 && selectedPhrases.length === phrases.length

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Phrase Generator
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Generate Vietnamese phrases using AI for your word puzzle images
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
              <Label htmlFor="category" className="text-card-foreground">
                Select Category
              </Label>
              <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
                <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <Select.Value placeholder="Choose a category..." />
                  <Select.Icon asChild>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                    <Select.Viewport className="p-1">
                      {CATEGORIES.map((category) => (
                        <Select.Item 
                          key={category.value} 
                          value={category.value}
                          className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            <Select.ItemIndicator>
                              <Check className="h-4 w-4" />
                            </Select.ItemIndicator>
                          </span>
                          <Select.ItemText>{category.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-topic" className="text-card-foreground">
                Or Custom Topic
              </Label>
              <Input
                id="custom-topic"
                placeholder="Enter your own topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="bg-input border-border text-foreground"
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
                onClick={handleRefresh}
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
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">
                  Generated Phrases ({phrases.length})
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select phrases to include in your image generation
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {allSelected ? (
                    <>
                      <Square className="h-4 w-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Select All
                    </>
                  )}
                </Button>

                {onDownloadAll && selectedPhrases.length > 0 && (
                  <Button
                    onClick={onDownloadAll}
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All ({selectedPhrases.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {phrases.map((phrase, index) => {
                const isSelected = selectedPhrases.includes(phrase)
                
                return (
                  <Button
                    key={`${phrase}-${index}`}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectPhrase(phrase)}
                    className="text-left justify-start h-auto py-2 px-3"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {isSelected ? (
                        <CheckSquare className="h-3 w-3 text-primary-foreground flex-shrink-0" />
                      ) : (
                        <Square className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="truncate">{phrase}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
            
            {selectedPhrases.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Selected Phrases ({selectedPhrases.length}):
                </p>
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
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>No phrases generated yet. Select a category or enter a topic to generate phrases.</p>
          {phrases.length === 0 && isLoading && (
            <p className="mt-2">Generating phrases...</p>
          )}
          <p className="text-xs mt-2">Debug: phrases.length = {phrases.length}</p>
        </div>
      )}
    </div>
  )
}