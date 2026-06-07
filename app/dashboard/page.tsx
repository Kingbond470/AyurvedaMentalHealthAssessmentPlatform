'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

interface SessionData {
  id: string
  respondent: {
    respondentCode: string
    name?: string
    age?: number
  }
  practitionerName: string
  status: string
  createdAt: string
  result?: {
    predominantPrakriti: string
    gad7Severity: string
  }
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('/api/sessions')
        setSessions(response.data)
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await axios.get('/api/export/csv', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `mpaap-export-${new Date().toISOString().split('T')[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to export CSV:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-dashboard px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display text-text-primary">MPAAP</h1>
            <p className="text-sm text-text-secondary font-ui">
              Sessions Dashboard
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-dashboard px-4 py-8">
        {/* CTA Buttons */}
        <div className="mb-8 flex gap-3">
          <Link
            href="/assessment/setup"
            className="inline-block px-6 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition"
          >
            Start New Assessment
          </Link>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-block px-6 py-3 bg-bg-section text-text-primary font-ui font-600 rounded-lg hover:bg-border-light transition disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>

        {/* Sessions List */}
        <div className="bg-bg-surface rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-border-light">
            <h2 className="text-xl font-display text-text-primary">
              Recent Sessions
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-text-secondary">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              No sessions yet. Start a new assessment to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-section">
                  <tr>
                    <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                      Respondent
                    </th>
                    <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                      Practitioner
                    </th>
                    <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                      Prakriti
                    </th>
                    <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                      GAD-7
                    </th>
                    <th className="px-6 py-3 text-left font-ui font-600 text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-bg-section transition">
                      <td className="px-6 py-4 font-body">
                        {session.respondent.name ||
                          session.respondent.respondentCode}
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-ui text-sm">
                        {session.practitionerName}
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-ui text-sm">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded text-xs font-ui font-600 ${
                            session.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-body">
                        {session.result?.predominantPrakriti || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-ui">
                        {session.result?.gad7Severity || '—'}
                      </td>
                      <td className="px-6 py-4 font-ui text-sm">
                        <Link
                          href={`/assessment/${session.id}`}
                          className="text-primary-500 hover:text-primary-600"
                        >
                          {session.status === 'IN_PROGRESS'
                            ? 'Resume'
                            : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
