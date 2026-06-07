'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

interface AdminStats {
  totalSessions: number
  completedSessions: number
  inProgressSessions: number
  prakritiBreaddown: Record<string, number>
  gad7Distribution: Record<string, number>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats')
        setStats(response.data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-dashboard px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display text-text-primary">
              MPAAP Admin Dashboard
            </h1>
            <p className="text-sm text-text-secondary font-ui">
              Research Data Management
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-ui bg-bg-section text-text-primary rounded hover:bg-border-light transition"
          >
            Back to Practitioner View
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-dashboard px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading admin dashboard...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-surface rounded-lg shadow-md p-6">
                <div className="text-sm font-ui text-text-secondary">
                  Total Sessions
                </div>
                <div className="text-3xl font-display text-text-primary mt-2">
                  {stats?.totalSessions || 0}
                </div>
              </div>
              <div className="bg-bg-surface rounded-lg shadow-md p-6">
                <div className="text-sm font-ui text-text-secondary">
                  Completed
                </div>
                <div className="text-3xl font-display text-text-primary mt-2">
                  {stats?.completedSessions || 0}
                </div>
              </div>
              <div className="bg-bg-surface rounded-lg shadow-md p-6">
                <div className="text-sm font-ui text-text-secondary">
                  In Progress
                </div>
                <div className="text-3xl font-display text-text-primary mt-2">
                  {stats?.inProgressSessions || 0}
                </div>
              </div>
            </div>

            {/* Admin Tools */}
            <div className="bg-bg-surface rounded-lg shadow-md p-6">
              <h2 className="text-xl font-display text-text-primary mb-4">
                Admin Tools
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/items"
                  className="px-4 py-2 bg-primary-500 text-white font-ui font-600 rounded hover:bg-primary-600 transition"
                >
                  Manage Item Bank (118 MPPI + 7 GAD-7)
                </Link>
                <Link
                  href="/admin/sessions"
                  className="px-4 py-2 bg-bg-section text-text-primary font-ui font-600 rounded hover:bg-border-light transition"
                >
                  View All Sessions
                </Link>
                <button className="px-4 py-2 bg-bg-section text-text-primary font-ui font-600 rounded hover:bg-border-light transition">
                  Export Data (CSV)
                </button>
                <Link
                  href="/admin/config"
                  className="px-4 py-2 bg-bg-section text-text-primary font-ui font-600 rounded hover:bg-border-light transition"
                >
                  Google Sheets Config
                </Link>
              </div>
            </div>

            {/* Distribution Charts Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-bg-surface rounded-lg shadow-md p-6">
                <h3 className="text-lg font-display text-text-primary mb-4">
                  Prakriti Distribution
                </h3>
                <div className="text-sm text-text-secondary">
                  Chart would display frequency of each of 16 subtypes across all
                  completed sessions
                </div>
              </div>
              <div className="bg-bg-surface rounded-lg shadow-md p-6">
                <h3 className="text-lg font-display text-text-primary mb-4">
                  GAD-7 Severity Distribution
                </h3>
                <div className="text-sm text-text-secondary">
                  Chart would display distribution of Minimal / Mild / Moderate / Severe
                  anxiety across sessions
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
