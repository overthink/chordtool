import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ALL_CHORDS, CHORD_BY_ID } from '@/lib/chords'

export function GET(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get('userId') ?? '', 10)
  if (!Number.isFinite(userId) || userId <= 0) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = getDb()
  const nowIso = new Date().toISOString()

  // First: chords due now (already reviewed at least once)
  const dueRow = db.prepare(`
    SELECT chord_id FROM chord_progress
    WHERE user_id = ? AND next_review <= ?
    ORDER BY next_review ASC
    LIMIT 1
  `).get(userId, nowIso) as { chord_id: string } | undefined

  if (dueRow) {
    const chord = CHORD_BY_ID.get(dueRow.chord_id)!
    return NextResponse.json({ chordId: chord.id, symbol: chord.symbol, imageUrl: chord.imageUrl })
  }

  // Second: new card (never seen by this user)
  const seenIds = (db.prepare(`
    SELECT chord_id FROM chord_progress WHERE user_id = ?
  `).all(userId) as { chord_id: string }[]).map(r => r.chord_id)

  const seenSet = new Set(seenIds)
  const newChord = ALL_CHORDS.find(c => !seenSet.has(c.id))

  if (newChord) {
    return NextResponse.json({ chordId: newChord.id, symbol: newChord.symbol, imageUrl: newChord.imageUrl })
  }

  // Third: all reviewed, none due — return earliest next_review (study ahead)
  const aheadRow = db.prepare(`
    SELECT chord_id FROM chord_progress
    WHERE user_id = ?
    ORDER BY next_review ASC
    LIMIT 1
  `).get(userId) as { chord_id: string } | undefined

  if (aheadRow) {
    const chord = CHORD_BY_ID.get(aheadRow.chord_id)!
    return NextResponse.json({ chordId: chord.id, symbol: chord.symbol, imageUrl: chord.imageUrl })
  }

  return NextResponse.json({ error: 'No chords available' }, { status: 404 })
}
