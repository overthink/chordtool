'use client'

import { useState, useCallback } from 'react'

export interface ChordCard {
  chordId: string
  symbol: string
  imageUrl: string
}

export interface UseSRSReturn {
  currentChord: ChordCard | null
  cardKey: number
  isLoading: boolean
  error: string | null
  fetchNextChord: (userId: number) => Promise<void>
  recordReview: (userId: number, chordId: string, responseTimeMs: number) => Promise<void>
}

export function useSRS(): UseSRSReturn {
  const [currentChord, setCurrentChord] = useState<ChordCard | null>(null)
  const [cardKey, setCardKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const advanceTo = useCallback((chord: ChordCard) => {
    setCurrentChord(chord)
    setCardKey(k => k + 1)
  }, [])

  const fetchNextChord = useCallback(async (userId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/chords/due?userId=${userId}`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      advanceTo(await res.json() as ChordCard)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chord')
    } finally {
      setIsLoading(false)
    }
  }, [advanceTo])

  const recordReview = useCallback(async (userId: number, chordId: string, responseTimeMs: number) => {
    setError(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, chordId, responseTimeMs }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json() as { nextChord: ChordCard | null }
      if (data.nextChord) {
        advanceTo(data.nextChord)
      } else {
        await fetchNextChord(userId)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record review')
    }
  }, [advanceTo, fetchNextChord])

  return { currentChord, cardKey, isLoading, error, fetchNextChord, recordReview }
}
