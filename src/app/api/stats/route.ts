import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get('userId') ?? '', 10)
  if (!Number.isFinite(userId) || userId <= 0) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = getDb()
  const rows = db.prepare(`
    SELECT chord_id, ease_factor, repetitions, interval_days, next_review, last_review
    FROM chord_progress
    WHERE user_id = ?
    ORDER BY next_review ASC
  `).all(userId)

  return NextResponse.json(rows)
}
