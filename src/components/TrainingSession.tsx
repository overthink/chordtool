'use client'

import { useCallback, useEffect, useState } from 'react'
import { Header } from './Header'
import { ChordTrainer } from './ChordTrainer'
import { HeldNotes } from './HeldNotes'
import { StatsView } from './StatsView'
import { useMidi } from '@/hooks/useMidi'
import { useSRS } from '@/hooks/useSRS'

interface Props {
  userId: number
  username: string
}

export function TrainingSession({ userId, username }: Props) {
  const [showStats, setShowStats] = useState(false)
  const { status, inputs, selectedInputId, setSelectedInputId, heldNotes, playChord } = useMidi()
  const { currentChord, cardKey, error, fetchNextChord, recordReview } = useSRS()

  useEffect(() => {
    fetchNextChord(userId)
  }, [userId, fetchNextChord])

  const handleChordPlayed = useCallback(async (responseTimeMs: number) => {
    if (!currentChord) return
    await recordReview(userId, currentChord.chordId, responseTimeMs)
  }, [currentChord, userId, recordReview])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        username={username}
        midiStatus={status}
        inputs={inputs}
        selectedInputId={selectedInputId}
        onSelectInput={setSelectedInputId}
        onToggleStats={() => setShowStats(s => !s)}
        showStats={showStats}
      />

      {showStats ? (
        <StatsView userId={userId} />
      ) : currentChord ? (
        <main className="flex-1 flex items-center justify-center">
          <ChordTrainer
            key={cardKey}
            chordId={currentChord.chordId}
            symbol={currentChord.symbol}
            imageUrl={currentChord.imageUrl}
            heldNotes={heldNotes}
            onChordPlayed={handleChordPlayed}
            playChord={playChord}
          />
        </main>
      ) : error ? (
        <main className="flex-1 flex items-center justify-center flex-col gap-3">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => fetchNextChord(userId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </main>
      ) : (
        <main className="flex-1 flex items-center justify-center text-gray-400">
          Loading chord…
        </main>
      )}
      <HeldNotes heldNotes={heldNotes} />
    </div>
  )
}
