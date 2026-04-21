'use client'

import { useEffect, useState } from 'react'

interface Props {
  chordId: string
  symbol: string
  showHint: boolean
  timeoutSeconds: number
}

export function ChordDisplay({ chordId, symbol, showHint, timeoutSeconds }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    setElapsed(0)
    const interval = setInterval(() => {
      setElapsed(s => s + 0.1)
    }, 100)
    return () => clearInterval(interval)
  }, [chordId])

  const progress = Math.min(elapsed / timeoutSeconds, 1)

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-9xl font-bold tracking-tight select-none">{symbol}</div>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${showHint ? 'bg-red-400' : 'bg-blue-500'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
