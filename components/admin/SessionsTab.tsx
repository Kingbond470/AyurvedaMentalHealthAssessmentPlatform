'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

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
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('COMPLETED')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

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

    // Filter by severity
    if (filterSeverity !== 'all' && session.result?.gad7_severity !== filterSeverity) {
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
    return <div className="text-center py-8">Loading sessions...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-bg-surface rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-display text-text-primary mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-ui text-text-secondary mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg font-ui bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            >
              <option value="all">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ABANDONED">Abandoned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-ui text-text-secondary mb-2">
              GAD-7 Severity
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg font-ui bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            >
              <option value="all">All</option>
              <option value="MINIMAL">Minimal</option>
              <option value="MILD">Mild</option>
              <option value="MODERATE">Moderate</option>
              <option value="SEVERE">Severe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-ui text-text-secondary mb-2">
              From Date
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
              To Date
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

      {/* Sessions Table */}
      <div className="bg-bg-surface rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-section border-b border-border-light">
              <tr>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  Respondent
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  Code
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  Age
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  Date
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  Prakriti
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  GAD-7 Score
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  Severity
                </th>
                <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-text-secondary">
                    No sessions found
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
                      {session.result?.gad7_total || '—'} / 21
                    </td>
                    <td className={`px-6 py-4 font-ui font-600 ${GAD7_COLORS[session.result?.gad7_severity as keyof typeof GAD7_COLORS] || 'text-text-secondary'}`}>
                      {session.result?.gad7_severity || '—'}
                    </td>
                    <td className="px-6 py-4 font-ui text-xs space-x-2">
                      <Link
                        href={`/results/${session.id}`}
                        className="inline-block px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
                      >
                        View
                      </Link>
                      <Link
                        href={`/results/${session.id}/report`}
                        className="inline-block px-3 py-1 bg-bg-section text-text-primary border border-border-light rounded hover:bg-border-light transition"
                      >
                        PDF
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-text-secondary font-ui">
        Showing {filteredSessions.length} of {sessions.length} sessions
      </div>
    </div>
  )
}
