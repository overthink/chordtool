'use client'

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

interface Props {
  heldNotes: Set<number>
}

export function HeldNotes({ heldNotes }: Props) {
  const pitchClasses = [...new Set([...heldNotes].map(n => n % 12))].sort((a, b) => a - b)
  const names = pitchClasses.map(pc => NOTE_NAMES[pc])

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4">
      <div className="text-sm text-gray-400 font-mono min-h-5">
        {names.join('  ')}
      </div>
    </div>
  )
}
