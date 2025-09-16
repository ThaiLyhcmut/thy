"use client"

import { useState, useCallback } from "react"

interface MinigameWordsResponse {
  words: string[]
  count: number
  category: string
  difficulty?: string
  available_categories: string[]
  success: boolean
  error?: string
}

interface MinigameWordsState {
  words: string[]
  isLoading: boolean
  error: string | null
  availableCategories: string[]
}

export function useMinigameWords() {
  const [state, setState] = useState<MinigameWordsState>({
    words: [],
    isLoading: false,
    error: null,
    availableCategories: []
  })

  const generateWords = useCallback(async (
    category: string = "all",
    count: number = 50,
    difficulty: string = "mixed"
  ): Promise<string[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(
        `/api/minigame-words?category=${encodeURIComponent(category)}&count=${count}&difficulty=${difficulty}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: MinigameWordsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Unknown error')
      }

      setState(prev => ({
        ...prev,
        words: data.words,
        availableCategories: data.available_categories,
        isLoading: false,
        error: null
      }))

      return data.words
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate words'

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))

      return []
    }
  }, [])

  const generateCustomWords = useCallback(async (
    options: {
      category?: string
      count?: number
      difficulty?: string
      exclude?: string[]
    }
  ): Promise<string[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/minigame-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: options.category || 'all',
          count: options.count || 50,
          difficulty: options.difficulty || 'mixed',
          exclude: options.exclude || []
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: MinigameWordsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Unknown error')
      }

      setState(prev => ({
        ...prev,
        words: data.words,
        isLoading: false,
        error: null
      }))

      return data.words
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate custom words'

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))

      return []
    }
  }, [])

  // Quick generators for specific categories
  const getProvinces = useCallback(async (count: number = 20): Promise<string[]> => {
    return generateWords('provinces', count, 'mixed')
  }, [generateWords])

  const getLandmarks = useCallback(async (count: number = 20): Promise<string[]> => {
    return generateWords('landmarks', count, 'mixed')
  }, [generateWords])

  const getFood = useCallback(async (count: number = 20): Promise<string[]> => {
    return generateWords('food', count, 'mixed')
  }, [generateWords])

  const getAnimals = useCallback(async (count: number = 20): Promise<string[]> => {
    return generateWords('animals', count, 'mixed')
  }, [generateWords])

  const getReduplicatedWords = useCallback(async (count: number = 15): Promise<string[]> => {
    return generateWords('reduplicated', count, 'mixed')
  }, [generateWords])

  const getCompoundWords = useCallback(async (count: number = 20): Promise<string[]> => {
    return generateWords('compound', count, 'mixed')
  }, [generateWords])

  const clearWords = useCallback(() => {
    setState({
      words: [],
      isLoading: false,
      error: null,
      availableCategories: []
    })
  }, [])

  return {
    ...state,
    generateWords,
    generateCustomWords,
    getProvinces,
    getLandmarks,
    getFood,
    getAnimals,
    getReduplicatedWords,
    getCompoundWords,
    clearWords
  }
}