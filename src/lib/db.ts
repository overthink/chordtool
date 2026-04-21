import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'chordtool.db')

let _db: Database.Database | null = null

const TABLES: Record<string, string> = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    ) STRICT
  `,
  chord_progress: `
    CREATE TABLE IF NOT EXISTS chord_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      chord_id TEXT NOT NULL,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetitions INTEGER NOT NULL DEFAULT 0,
      interval_days INTEGER NOT NULL DEFAULT 1,
      next_review TEXT NOT NULL,
      last_review TEXT,
      UNIQUE(user_id, chord_id)
    ) STRICT
  `,
  review_log: `
    CREATE TABLE IF NOT EXISTS review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      chord_id TEXT NOT NULL,
      response_time_ms INTEGER NOT NULL,
      quality INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL
    ) STRICT
  `,
}

function setup(db: Database.Database) {
  for (const ddl of Object.values(TABLES)) {
    db.exec(ddl)
  }
}

export function getDb(): Database.Database {
  if (!_db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    setup(_db)
  }
  return _db
}
