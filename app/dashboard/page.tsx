'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import axios from 'axios'
import Link from 'next/link'

interface SessionData {
  id: string
  respondent: {
    respondentCode: string
    name?: string
    age?: number
  }
  status: string
  createdAt: string
  result?: {
    predominantPrakriti: string
    gad7Severity: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, token, logout } = useAuthStore()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    const fetchSessions = async () => {
      try {
        const response = await axios.get('/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSessions(response.data)
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [token, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-dashboard px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display text-text-primary">MPAAP</h1>
            <p className="text-sm text-text-secondary font-ui">
              Practitioner Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-ui text-text-secondary">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-ui bg-bg-section text-text-primary rounded hover:bg-border-light transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-dashboard px-4 py-8">
        {/* CTA Button */}
        <div className="mb-8">
          <Link
            href="/assessment/setup"
            className="inline-block px-6 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition"
          >
            Start New Assessment
          </Link>
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
