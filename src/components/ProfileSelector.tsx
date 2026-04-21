'use client'

import { useState, useEffect } from 'react'

interface User {
  id: number
  username: string
}

interface Props {
  onProfileSelected: (userId: number, username: string) => void
}

export function ProfileSelector({ onProfileSelected }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [newUsername, setNewUsername] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
      .catch(() => {})
  }, [])

  async function createProfile() {
    const trimmed = newUsername.trim()
    if (!trimmed) return
    setError('')
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: trimmed }),
    })
    if (res.ok) {
      const user = await res.json() as User
      onProfileSelected(user.id, user.username)
    } else {
      const data = await res.json() as { error: string }
      setError(data.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Chord Trainer</h1>

        {users.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Existing profiles</p>
            <ul className="space-y-2">
              {users.map(u => (
                <li key={u.id}>
                  <button
                    onClick={() => onProfileSelected(u.id, u.username)}
                    className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors font-medium"
                  >
                    {u.username}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-2">New profile</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createProfile()}
              placeholder="Your name"
              maxLength={30}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={createProfile}
              disabled={!newUsername.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Start
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
