'use client'

import { useEffect, useRef, useState } from 'react'
import { ChordDisplay } from './ChordDisplay'
import { ChordHint } from './ChordHint'
import { CHORD_BY_ID } from '@/lib/chords'

const HINT_TIMEOUT_MS = 10_000

interface Props {
  chordId: string
  symbol: string
  imageUrl: string
  heldNotes: Set<number>
  onChordPlayed: (responseTimeMs: number) => void
  playChord: (pitchClasses: number[], durationMs?: number) => void
}

export function ChordTrainer({ chordId, symbol, imageUrl, heldNotes, onChordPlayed, playChord }: Props) {
  const [showHint, setShowHint] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const hasMatchedRef = useRef(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()
    hasMatchedRef.current = false
    setShowHint(false)

    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => setShowHint(true), HINT_TIMEOUT_MS)

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [chordId])

  // Check for chord match on every heldNotes change.
  // heldNotes contains raw MIDI note numbers; derive pitch classes before matching
  // so that releasing one octave of a doubled note doesn't clear the pitch class.
  useEffect(() => {
    if (hasMatchedRef.current) return
    const chord = CHORD_BY_ID.get(chordId)
    if (!chord || chord.pitchClasses.length === 0 || heldNotes.size === 0) return

    const heldPitchClasses = new Set([...heldNotes].map(n => n % 12))
    const isMatch = chord.pitchClasses.every(pc => heldPitchClasses.has(pc))
    if (isMatch) {
      hasMatchedRef.current = true
      onChordPlayed(Date.now() - startTimeRef.current)
    }
  }, [heldNotes, chordId, onChordPlayed])

  const chord = CHORD_BY_ID.get(chordId)

  return (
    <div className="flex flex-col items-center py-12">
      <ChordDisplay chordId={chordId} symbol={symbol} showHint={showHint} timeoutSeconds={HINT_TIMEOUT_MS / 1000} />
      {chord && (
        <button
          onClick={() => playChord(chord.pitchClasses)}
          className="mt-6 px-4 py-2 text-sm text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-400 rounded-lg transition-colors"
        >
          ▶ Play
        </button>
      )}
      {showHint && <ChordHint chordId={chordId} imageUrl={imageUrl} />}
    </div>
  )
}
