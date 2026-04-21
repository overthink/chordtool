'use client'

import { useState, useEffect } from 'react'
import { CHORD_BY_ID } from '@/lib/chords'

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

interface Props {
  chordId: string
  imageUrl: string
}

export function ChordHint({ chordId, imageUrl }: Props) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [chordId])

  const chord = CHORD_BY_ID.get(chordId)
  const noteNames = chord ? chord.pitchClasses.map(pc => NOTE_NAMES[pc]).join(', ') : ''

  if (imgFailed) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-sm text-gray-500 mb-1">Notes</p>
        <p className="text-xl font-semibold">{noteNames}</p>
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <img
        src={imageUrl}
        alt={`Piano diagram for ${chordId}`}
        onError={() => setImgFailed(true)}
        className="max-w-xs shadow-md"
      />
      <p className="text-sm text-gray-500">Notes: {noteNames}</p>
    </div>
  )
}
