'use client'

import { Input } from 'webmidi'
import { MidiStatus } from '@/hooks/useMidi'

interface Props {
  username: string
  midiStatus: MidiStatus
  inputs: Input[]
  selectedInputId: string | null
  onSelectInput: (id: string) => void
  onToggleStats: () => void
  showStats: boolean
  onSwitchProfile: () => void
}

export function Header({ username, midiStatus, inputs, selectedInputId, onSelectInput, onToggleStats, showStats, onSwitchProfile }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-700">{username}</span>
        <button
          onClick={onToggleStats}
          className="text-sm text-blue-600 hover:underline"
        >
          {showStats ? 'Train' : 'Stats'}
        </button>
        <button
          onClick={onSwitchProfile}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-400 rounded px-2 py-0.5 transition-colors"
        >
          Pause
        </button>
      </div>

      <div className="flex items-center gap-2">
        {(midiStatus === 'denied' || midiStatus === 'unsupported') ? (
          <span className="flex items-center gap-1.5 text-sm text-red-600">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            {midiStatus === 'denied' ? 'MIDI denied' : 'MIDI unsupported'}
          </span>
        ) : midiStatus === 'loading' ? (
          <span className="text-sm text-gray-400">Connecting MIDI…</span>
        ) : (
          <select
            value={selectedInputId ?? ''}
            onChange={e => onSelectInput(e.target.value)}
            disabled={inputs.length === 0}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white disabled:opacity-50"
          >
            {inputs.length === 0 ? (
              <option value="">No MIDI devices</option>
            ) : (
              inputs.map(input => (
                <option key={input.id} value={input.id}>
                  {input.name}
                </option>
              ))
            )}
          </select>
        )}
      </div>
    </header>
  )
}
