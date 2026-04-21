'use client'

import { useState, useEffect } from 'react'

interface ProgressRow {
  chord_id: string
  ease_factor: number
  repetitions: number
  interval_days: number
  next_review: string
  last_review: string | null
}

interface Props {
  userId: number
}

export function StatsView({ userId }: Props) {
  const [rows, setRows] = useState<ProgressRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stats?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setRows(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  const today = new Date().toISOString().slice(0, 10)
  const dueCount = rows.filter(r => r.next_review <= today).length

  if (loading) return <div className="p-8 text-center text-gray-400">Loading…</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-4 flex-1 text-center">
          <div className="text-3xl font-bold">{rows.length}</div>
          <div className="text-sm text-gray-500">Cards seen</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex-1 text-center">
          <div className="text-3xl font-bold text-blue-600">{dueCount}</div>
          <div className="text-sm text-gray-500">Due today</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex-1 text-center">
          <div className="text-3xl font-bold">
            {rows.length > 0 ? (rows.reduce((s, r) => s + r.ease_factor, 0) / rows.length).toFixed(2) : '—'}
          </div>
          <div className="text-sm text-gray-500">Avg ease</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-gray-400">No reviews yet. Start training!</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Chord</th>
                <th className="px-4 py-3 text-right">Reps</th>
                <th className="px-4 py-3 text-right">Ease</th>
                <th className="px-4 py-3 text-right">Interval</th>
                <th className="px-4 py-3 text-right">Next Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.chord_id} className={r.next_review <= today ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-2 font-mono font-semibold">{r.chord_id}</td>
                  <td className="px-4 py-2 text-right">{r.repetitions}</td>
                  <td className="px-4 py-2 text-right">{r.ease_factor.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{r.interval_days}d</td>
                  <td className="px-4 py-2 text-right text-gray-500">{r.next_review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
