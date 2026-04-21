import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export function GET() {
  const db = getDb()
  const users = db.prepare('SELECT id, username, created_at FROM users ORDER BY username').all()
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const { username } = await req.json()
  if (!username || typeof username !== 'string' || !username.trim()) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }
  const clean = username.trim().slice(0, 30)
  const db = getDb()
  try {
    const result = db
      .prepare('INSERT INTO users (username, created_at) VALUES (?, ?) RETURNING id, username')
      .get(clean, new Date().toISOString()) as { id: number; username: string }
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
  }
}
