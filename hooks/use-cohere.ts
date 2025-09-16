"use client"

import { useState, useCallback } from "react"

interface CohereResponse {
  text: string
  generations?: Array<{
    text: string
  }>
}

interface GeneratedPhrases {
  phrases: string[]
  isLoading: boolean
  error: string | null
}

export function useCohere() {
  const [state, setState] = useState<GeneratedPhrases>({
    phrases: [],
    isLoading: false,
    error: null
  })

  const generateVietnamesePhrases = useCallback(async (
    topic: string = "general", 
    count: number = 50
  ): Promise<string[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const prompt = `Generate ${count} Vietnamese words and short phrases for minigames. Topic: "${topic}".

Requirements:
- Single words or 2-3 word phrases only
- Common Vietnamese vocabulary
- Perfect for word games and puzzles
- Easy to type and remember
- Family-friendly content

Format: One word/phrase per line, no numbers or bullets.

Examples:
Bánh mì
Cà phê
Xe đạp
Hoa đào
Gia đình
Học sinh
Trường học
Bóng đá
Âm nhạc
Thể thao

Topic: ${topic}
Words/Phrases:`

      // Call Cohere API through your backend or directly
      const response = await fetch('/api/cohere/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          max_tokens: 800, // Increase for more phrases
          temperature: 0.8,
          model: 'command'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CohereResponse = await response.json()
      
      // Extract phrases from response
      let generatedText = data.text || data.generations?.[0]?.text || ''
      
      // Clean and filter phrases
      const phrases = generatedText
        .split('\n')
        .map(phrase => phrase.trim())
        .filter(phrase => 
          phrase && 
          phrase.length > 0 && 
          !phrase.match(/^\d+\./) && // Remove numbered items
          !phrase.startsWith('-') && // Remove bullet points
          phrase.length <= 50 // Reasonable length limit
        )
        .slice(0, count) // Limit to requested count

      setState(prev => ({
        ...prev,
        phrases,
        isLoading: false,
        error: null
      }))

      console.log("Hook updated with phrases:", phrases.length)
      return phrases
    } catch (error) {
      console.error('Cohere API error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate phrases'
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))

      return []
    }
  }, [])

  // Generate phrases by category
  const generateByCategory = useCallback(async (category: string) => {
    const categoryPrompts: Record<string, string> = {
      'greetings': 'greetings and polite expressions',
      'family': 'family and relationships',
      'food': 'Vietnamese food and cooking',
      'travel': 'travel and transportation',
      'work': 'work and business',
      'emotions': 'emotions and feelings',
      'weather': 'weather and nature',
      'hobbies': 'hobbies and activities',
      'education': 'education and learning',
      'health': 'health and wellness'
    }

    const topic = categoryPrompts[category] || category
    return generateVietnamesePhrases(topic, 50)
  }, [generateVietnamesePhrases])

  // Mock fallback phrases if API fails
  const mockPhrases = [
    "Xin chào bạn", "Hẹn gặp lại", "Chúc bạn một ngày tốt lành",
    "Tôi đang học lập trình", "Trời hôm nay thật đẹp", "Bạn có khỏe không",
    "Chúng ta cùng đi ăn trưa", "Cuộc sống là những chuyến đi", "Gia đình là số một",
    "Thành công đến từ nỗ lực", "Cà phê sữa đá buổi sáng", "Hạnh phúc giản đơn",
    "Thời gian quý hơn vàng", "Tình bạn mãi mãi", "Ước mơ không bao giờ tắt",
    "Sách là kho tàng tri thức", "Mỗi ngày một niềm vui", "Nụ cười tỏa nắng",
    "Học tập suốt đời", "Vượt qua thử thách"
  ]

  const generateMockPhrases = useCallback(async (category?: string): Promise<string[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Shuffle and return mock phrases
    const shuffled = [...mockPhrases].sort(() => Math.random() - 0.5)
    const phrases = shuffled.slice(0, 15)
    
    setState(prev => ({
      ...prev,
      phrases,
      isLoading: false
    }))

    return phrases
  }, [])

  const clearPhrases = useCallback(() => {
    setState({
      phrases: [],
      isLoading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    generateVietnamesePhrases,
    generateByCategory,
    generateMockPhrases, // For testing without Cohere API
    clearPhrases
  }
}