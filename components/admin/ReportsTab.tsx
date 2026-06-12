'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getLabel } from '@/lib/localization'
import { useSessionStore } from '@/lib/store'

interface Stats {
  totalSessions: number
  completedSessions: number
  inProgressSessions: number
  avgDuration?: number
  lastSessionTime?: string
  prakritiDistribution: Record<string, number>
  gad7Distribution: Record<string, number>
}

const GAD7_SEVERITY_COLORS = {
  MINIMAL: '#4A8C6A',
  MILD: '#C4A23A',
  MODERATE: '#C46B3A',
  SEVERE: '#B03A3A',
}

export default function ReportsTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const language = useSessionStore((state) => state.language)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/admin/stats')
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await axios.get('/api/export/csv', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `sessions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      console.error('Failed to export CSV:', error)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">{getLabel('loading', language)}</div>
  }

  if (!stats) {
    return <div className="text-center py-8">{getLabel('noSessions', language)}</div>
  }

  const prakritiData = Object.entries(stats.prakritiDistribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  )

  const gad7Data = Object.entries(stats.gad7Distribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  )

  const completionRate = Math.round(
    (stats.completedSessions / stats.totalSessions) * 100
  )

  return (
    <div className="space-y-8">
      {/* Session Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface rounded-lg shadow-sm p-6">
          <div className="text-sm font-ui text-text-secondary mb-2">
            {getLabel('totalSessions', language)}
          </div>
          <div className="text-3xl font-display text-text-primary">
            {stats.totalSessions}
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg shadow-sm p-6">
          <div className="text-sm font-ui text-text-secondary mb-2">
            {getLabel('completed', language)}
          </div>
          <div className="text-3xl font-display text-text-primary">
            {stats.completedSessions}
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            {completionRate}% {getLabel('completionRate', language)}
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg shadow-sm p-6">
          <div className="text-sm font-ui text-text-secondary mb-2">
            {getLabel('inProgressSessions', language)}
          </div>
          <div className="text-3xl font-display text-text-primary">
            {stats.inProgressSessions}
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            {Math.round(
              (stats.inProgressSessions / stats.totalSessions) * 100
            )}
            % {getLabel('activePercentage', language)}
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg shadow-sm p-6">
          <div className="text-sm font-ui text-text-secondary mb-2">
            {getLabel('avgDuration', language)}
          </div>
          <div className="text-3xl font-display text-text-primary">
            {stats.avgDuration || 0}m
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            {stats.lastSessionTime ? `${getLabel('lastSession', language)}: ${stats.lastSessionTime}` : getLabel('noSessions', language)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prakriti Distribution */}
        <div className="bg-bg-surface rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-display text-text-primary mb-4">
            {getLabel('prakritidistribution', language)}
          </h3>
          {prakritiData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prakritiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD5" />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tick={{ fill: '#5A5A55' }}
                />
                <YAxis fontSize={12} tick={{ fill: '#5A5A55' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAFAF7',
                    border: '1px solid #E0DDD5',
                  }}
                />
                <Bar dataKey="value" fill="#3D6B4F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-text-secondary">
              {getLabel('noPrakritiData', language)}
            </div>
          )}
        </div>

        {/* GAD-7 Severity Distribution */}
        <div className="bg-bg-surface rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-display text-text-primary mb-4">
            {getLabel('gad7SeverityBreakdown', language)}
          </h3>
          {gad7Data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gad7Data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gad7Data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        GAD7_SEVERITY_COLORS[
                          entry.name as keyof typeof GAD7_SEVERITY_COLORS
                        ] || '#8884d8'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-text-secondary">
              {getLabel('noGad7Data', language)}
            </div>
          )}
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-bg-surface rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-display text-text-primary mb-4">
          {getLabel('dataExport', language)}
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-ui font-600 hover:bg-primary-600 disabled:opacity-50 transition"
          >
            {exporting ? getLabel('exporting', language) : getLabel('downloadCsv', language)} {getLabel('allSessionsScores', language)}
          </button>
          <button
            disabled
            className="w-full px-6 py-3 bg-bg-section border border-border-light text-text-primary rounded-lg font-ui font-600 disabled:opacity-50 transition"
          >
            {getLabel('exportToGoogleSheets', language)} - {getLabel('comingSoon', language)}
          </button>
          <button
            disabled
            className="w-full px-6 py-3 bg-bg-section border border-border-light text-text-primary rounded-lg font-ui font-600 disabled:opacity-50 transition"
          >
            {getLabel('generatePdfReport', language)} - {getLabel('comingSoon', language)}
          </button>
        </div>
      </div>
    </div>
  )
}
