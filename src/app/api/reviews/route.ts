import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { CHORD_BY_ID, ALL_CHORDS } from '@/lib/chords'
import { updateSM2, responseTimeToQuality, DEFAULT_SM2_STATE } from '@/lib/sm2'

export async function POST(req: Request) {
  const { userId, chordId, responseTimeMs } = await req.json()

  if (!Number.isInteger(userId) || !chordId || typeof responseTimeMs !== 'number') {
    return NextResponse.json({ error: 'userId (int), chordId, responseTimeMs required' }, { status: 400 })
  }

  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  const quality = responseTimeToQuality(responseTimeMs)

  const existing = db.prepare(`
    SELECT ease_factor, repetitions, interval_days
    FROM chord_progress WHERE user_id = ? AND chord_id = ?
  `).get(userId, chordId) as { ease_factor: number; repetitions: number; interval_days: number } | undefined

  const state = existing
    ? { easeFactor: existing.ease_factor, repetitions: existing.repetitions, intervalDays: existing.interval_days }
    : DEFAULT_SM2_STATE

  const result = updateSM2(state, quality)

  db.transaction(() => {
    db.prepare(`
      INSERT INTO chord_progress (user_id, chord_id, ease_factor, repetitions, interval_days, next_review, last_review)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, chord_id) DO UPDATE SET
        ease_factor = excluded.ease_factor,
        repetitions = excluded.repetitions,
        interval_days = excluded.interval_days,
        next_review = excluded.next_review,
        last_review = excluded.last_review
    `).run(userId, chordId, result.easeFactor, result.repetitions, result.intervalDays, result.nextReview, today)

    db.prepare(`
      INSERT INTO review_log (user_id, chord_id, response_time_ms, quality, reviewed_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, chordId, responseTimeMs, quality, new Date().toISOString())
  })()

  // Failed cards come back immediately; successes advance to next due card
  let nextChord = quality < 3 ? CHORD_BY_ID.get(chordId) : undefined

  if (!nextChord) {
    const dueRow = db.prepare(`
      SELECT chord_id FROM chord_progress
      WHERE user_id = ? AND next_review <= ? AND chord_id != ?
      ORDER BY next_review ASC LIMIT 1
    `).get(userId, today, chordId) as { chord_id: string } | undefined
    if (dueRow) nextChord = CHORD_BY_ID.get(dueRow.chord_id)
  }

  if (!nextChord) {
    const seenIds = (db.prepare(`
      SELECT chord_id FROM chord_progress WHERE user_id = ?
    `).all(userId) as { chord_id: string }[]).map(r => r.chord_id)
    const seenSet = new Set(seenIds)
    nextChord = ALL_CHORDS.find(c => !seenSet.has(c.id))
  }

  if (!nextChord) {
    const aheadRow = db.prepare(`
      SELECT chord_id FROM chord_progress
      WHERE user_id = ?
      ORDER BY next_review ASC LIMIT 1
    `).get(userId) as { chord_id: string } | undefined
    if (aheadRow) nextChord = CHORD_BY_ID.get(aheadRow.chord_id)
  }

  return NextResponse.json({
    quality,
    nextReview: result.nextReview,
    nextChord: nextChord
      ? { chordId: nextChord.id, symbol: nextChord.symbol, imageUrl: nextChord.imageUrl }
      : null,
  })
}
