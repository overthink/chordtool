'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { WebMidi, Input } from 'webmidi'

export type MidiStatus = 'loading' | 'enabled' | 'denied' | 'unsupported'

export interface UseMidiReturn {
  status: MidiStatus
  inputs: Input[]
  selectedInputId: string | null
  setSelectedInputId: (id: string) => void
  // Raw MIDI note numbers (0-127) currently held. Use % 12 for pitch class.
  heldNotes: Set<number>
}

type NoteHandlers = { noteon: (e: { note: { number: number } }) => void; noteoff: (e: { note: { number: number } }) => void }

export function useMidi(): UseMidiReturn {
  const [status, setStatus] = useState<MidiStatus>('loading')
  const [inputs, setInputs] = useState<Input[]>([])
  const [selectedInputId, setSelectedInputIdState] = useState<string | null>(null)
  // Stores raw MIDI note numbers so releasing one octave doesn't clear the
  // pitch class when another octave of the same note is still held.
  const [heldNotes, setHeldNotes] = useState<Set<number>>(new Set())

  const selectedInputIdRef = useRef<string | null>(null)
  const handlersRef = useRef<Map<string, NoteHandlers>>(new Map())

  const attachListeners = useCallback((input: Input) => {
    const onNoteOn = (event: { note: { number: number } }) => {
      setHeldNotes(prev => new Set(prev).add(event.note.number))
    }
    const onNoteOff = (event: { note: { number: number } }) => {
      setHeldNotes(prev => {
        const next = new Set(prev)
        next.delete(event.note.number)
        return next
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input.addListener('noteon', onNoteOn as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input.addListener('noteoff', onNoteOff as any)
    handlersRef.current.set(input.id, { noteon: onNoteOn, noteoff: onNoteOff })
  }, [])

  const detachListeners = useCallback((input: Input) => {
    const handlers = handlersRef.current.get(input.id)
    if (handlers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input.removeListener('noteon', handlers.noteon as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input.removeListener('noteoff', handlers.noteoff as any)
      handlersRef.current.delete(input.id)
    }
  }, [])

  const setSelectedInputId = useCallback((id: string) => {
    if (selectedInputIdRef.current) {
      const prev = WebMidi.inputs.find(i => i.id === selectedInputIdRef.current)
      if (prev) detachListeners(prev)
    }
    selectedInputIdRef.current = id
    setSelectedInputIdState(id)
    setHeldNotes(new Set())
    const input = WebMidi.inputs.find(i => i.id === id)
    if (input) attachListeners(input)
  }, [attachListeners, detachListeners])

  useEffect(() => {
    let mounted = true

    const onConnected = () => {
      if (!mounted) return
      setInputs([...WebMidi.inputs])
    }
    const onDisconnected = () => {
      if (!mounted) return
      const remaining = [...WebMidi.inputs]
      setInputs(remaining)
      if (remaining.length === 0) {
        selectedInputIdRef.current = null
        setSelectedInputIdState(null)
        setHeldNotes(new Set())
      } else if (!remaining.find(i => i.id === selectedInputIdRef.current)) {
        setSelectedInputId(remaining[0].id)
      }
    }

    const setup = () => {
      const currentInputs = WebMidi.inputs
      setInputs(currentInputs)
      setStatus('enabled')
      if (currentInputs.length > 0 && !selectedInputIdRef.current) {
        setSelectedInputId(currentInputs[0].id)
      }
      WebMidi.addListener('connected', onConnected)
      WebMidi.addListener('disconnected', onDisconnected)
    }

    if (WebMidi.enabled) {
      setup()
    } else {
      WebMidi.enable()
        .then(() => {
          if (!mounted) return
          setup()
        })
        .catch((err: Error) => {
          if (!mounted) return
          if (err.name === 'SecurityError' || err.message?.includes('denied')) {
            setStatus('denied')
          } else {
            setStatus('unsupported')
          }
        })
    }

    return () => {
      mounted = false
      WebMidi.removeListener('connected', onConnected)
      WebMidi.removeListener('disconnected', onDisconnected)
    }
  }, [setSelectedInputId])

  return { status, inputs, selectedInputId, setSelectedInputId, heldNotes }
}
