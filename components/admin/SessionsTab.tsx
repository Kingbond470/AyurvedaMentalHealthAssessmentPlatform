'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { getLabel } from '@/lib/localization'
import { useSessionStore } from '@/lib/store'

interface SessionData {
  id: string
  respondent_id: string
  respondent?: {
    respondent_code: string
    name?: string
    age?: number
    gender?: string
  }
  result?: {
    predominant_prakriti: string
    gad7_total: number
    gad7_severity: string
  }
  created_at: string
  completed_at?: string
  status: string
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('COMPLETED')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const language = useSessionStore((state) => state.language)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/sessions')
      setSessions(response.data || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter((session) => {
    // Filter by status
    if (filterStatus !== 'all' && session.status !== filterStatus) {
      return false
    }

    // Filter by date range
    if (dateFrom) {
      const sessionDate = new Date(session.created_at)
      const fromDate = new Date(dateFrom)
      if (sessionDate < fromDate) return false
    }

    if (dateTo) {
      const sessionDate = new Date(session.created_at)
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (sessionDate > toDate) return false
    }

    return true
  })

  const GAD7_COLORS = {
    MINIMAL: 'text-green-600',
    MILD: 'text-yellow-600',
    MODERATE: 'text-orange-600',
    SEVERE: 'text-red-600',
  }

  if (loading) {
    return <div className="text-center py-8">{getLabel('loading', language)}</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-bg-surface rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-display text-text-primary mb-4">{getLabel('filters', language)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-ui text-text-secondary mb-2">
              {getLabel('status', language)}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg font-ui bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            >
              <option value="all">{getLabel('all', language)}</option>
              <option value="COMPLETED">{getLabel('completed', language)}</option>
              <option value="IN_PROGRESS">{getLabel('inProgress', language)}</option>
              <option value="ABANDONED">{getLabel('abandoned', language)}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-ui text-text-secondary mb-2">
              {getLabel('fromDate', language)}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg font-ui bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-ui text-text-secondary mb-2">
              {getLabel('toDate', language)}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg font-ui bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Sessions Table — desktop */}
      <div className="hidden md:block bg-bg-surface rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-section border-b border-border-light">
              <tr>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('respondent', language)}
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('code', language)}
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('age', language)}
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('date', language)}
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('prakriti', language)}
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('score', language)}
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('severity', language)}
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  {getLabel('actions', language)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-text-secondary">
                    {getLabel('noSessionsFound', language)}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-bg-section transition">
                    <td className="px-6 py-4 font-ui text-text-primary">
                      {session.respondent?.name || '—'}
                    </td>
                    <td className="px-6 py-4 font-ui text-text-secondary text-xs font-mono">
                      {session.respondent?.respondent_code || '—'}
                    </td>
                    <td className="px-6 py-4 font-ui text-text-primary">
                      {session.respondent?.age || '—'}
                    </td>
                    <td className="px-6 py-4 font-ui text-text-secondary text-xs">
                      {new Date(session.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-ui text-text-primary">
                      {session.result?.predominant_prakriti || '—'}
                    </td>
                    <td className="px-6 py-4 font-ui font-600 text-text-primary">
                      {session.result?.gad7_total ?? '—'} / 21
                    </td>
                    <td className={`px-6 py-4 font-ui font-600 ${GAD7_COLORS[session.result?.gad7_severity as keyof typeof GAD7_COLORS] || 'text-text-secondary'}`}>
                      {session.result?.gad7_severity || '—'}
                    </td>
                    <td className="px-6 py-4 font-ui text-xs space-x-2">
                      <Link
                        href={`/results/${session.id}`}
                        className="inline-block px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
                      >
                        {getLabel('view', language)}
                      </Link>
                      <Link
                        href={`/results/${session.id}/report`}
                        className="inline-block px-3 py-1 bg-bg-section text-text-primary border border-border-light rounded hover:bg-border-light transition"
                      >
                        {getLabel('pdf', language)}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sessions Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-bg-surface rounded-lg shadow-sm px-4 py-8 text-center text-text-secondary font-ui text-sm">
            {getLabel('noSessionsFound', language)}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="bg-bg-surface rounded-lg shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-ui font-600 text-text-primary text-sm">
                    {session.respondent?.name || '—'}
                  </div>
                  <div className="font-mono text-xs text-text-tertiary mt-0.5">
                    {session.respondent?.respondent_code || '—'}
                  </div>
                </div>
                <div className="text-xs text-text-secondary font-ui">
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-ui">
                <div>
                  <div className="text-text-tertiary">Age</div>
                  <div className="text-text-primary font-600">{session.respondent?.age || '—'}</div>
                </div>
                <div>
                  <div className="text-text-tertiary">Prakriti</div>
                  <div className="text-text-primary font-600">{session.result?.predominant_prakriti || '—'}</div>
                </div>
                <div>
                  <div className="text-text-tertiary">GAD-7</div>
                  <div className={`font-600 ${GAD7_COLORS[session.result?.gad7_severity as keyof typeof GAD7_COLORS] || 'text-text-secondary'}`}>
                    {session.result?.gad7_total ?? '—'} / 21
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/results/${session.id}`}
                  className="flex-1 py-2 bg-primary-500 text-white rounded font-ui font-600 text-xs text-center hover:bg-primary-600 transition"
                >
                  {getLabel('view', language)}
                </Link>
                <Link
                  href={`/results/${session.id}/report`}
                  className="flex-1 py-2 bg-bg-section text-text-primary border border-border-light rounded font-ui font-600 text-xs text-center hover:bg-border-light transition"
                >
                  {getLabel('pdf', language)}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-text-secondary font-ui">
        {getLabel('showing', language)} {filteredSessions.length} {getLabel('of', language)} {sessions.length} {getLabel('sessions', language)}
      </div>
    </div>
  )
}
