'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChordDisplay } from './ChordDisplay'
import { ChordHint } from './ChordHint'
import { CHORD_BY_ID } from '@/lib/chords'

const HINT_TIMEOUT_MS = 10_000
// How long after card load before match detection activates.
// Prevents carried-over held notes from instantly matching the new chord.
const READY_DELAY_MS = 500

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
  // Using state (not ref) so that when the ready timer fires, it triggers a
  // re-render and the match effect re-runs against the currently held notes.
  const [ready, setReady] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const hasMatchedRef = useRef(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const markReady = useCallback(() => {
    setReady(prev => {
      if (prev) return prev
      startTimeRef.current = Date.now()
      return true
    })
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current)
  }, [])

  useEffect(() => {
    hasMatchedRef.current = false
    setReady(false)
    startTimeRef.current = Date.now()
    setShowHint(false)

    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => setShowHint(true), HINT_TIMEOUT_MS)

    if (readyTimerRef.current) clearTimeout(readyTimerRef.current)
    readyTimerRef.current = setTimeout(markReady, READY_DELAY_MS)

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current)
    }
  }, [chordId, markReady])

  // Become ready immediately when the user releases all keys (no need to wait
  // for the full 500ms timer in the normal case).
  useEffect(() => {
    if (!ready && heldNotes.size === 0) markReady()
  }, [heldNotes, ready, markReady])

  // Check for chord match on every heldNotes or ready change.
  // heldNotes stores raw MIDI note numbers; derive pitch classes before matching
  // so releasing one octave of a doubled note doesn't clear the pitch class.
  useEffect(() => {
    if (hasMatchedRef.current || !ready || heldNotes.size === 0) return
    const chord = CHORD_BY_ID.get(chordId)
    if (!chord || chord.pitchClasses.length === 0) return

    const heldPitchClasses = new Set([...heldNotes].map(n => n % 12))
    const isMatch = chord.pitchClasses.every(pc => heldPitchClasses.has(pc))
    if (isMatch) {
      hasMatchedRef.current = true
      onChordPlayed(Date.now() - startTimeRef.current)
    }
  }, [ready, heldNotes, chordId, onChordPlayed])

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
      <ChordHint chordId={chordId} imageUrl={imageUrl} visible={showHint} />
    </div>
  )
}
