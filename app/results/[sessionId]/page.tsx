'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ALL_SUBTYPES, getPrakritiFullName, PRAKRITI_CATEGORY } from '@/lib/scoring'

interface SessionData {
  id: string
  respondent: {
    respondentCode: string
    name?: string
    age?: number
    gender?: string
  }
  result: {
    predominantPrakriti: string
    secondaryPrakriti: string
    primaryCategory: string
    subtypePercentages: Record<string, number>
    gad7Total: number
    gad7Severity: string
    gad7Impairment: string
  }
  completedAt: string
}

const CATEGORY_COLORS = {
  SATTVIKA: '#3D6B4F',
  RAJASIKA: '#8B5A2B',
  TAMASIKA: '#5A5A7A',
}

const GAD7_SEVERITY_COLORS = {
  MINIMAL: '#4A8C6A',
  MILD: '#C4A23A',
  MODERATE: '#C46B3A',
  SEVERE: '#B03A3A',
}

export default function ResultsPage() {
  const params = useParams()

  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(
          `/api/sessions/${sessionId}`
        )
        setSession(response.data)
      } catch (error) {
        console.error('Failed to fetch session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <p className="text-text-secondary font-body">Loading results...</p>
      </div>
    )
  }

  if (!session || !session.result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <p className="text-text-secondary font-body">Results not found</p>
      </div>
    )
  }

  const chartData = ALL_SUBTYPES.map((subtype) => ({
    name: subtype,
    value: session.result.subtypePercentages[subtype] || 0,
    category: PRAKRITI_CATEGORY[subtype] || 'UNKNOWN',
  })).sort((a, b) => b.value - a.value)

  const severityLabel =
    session.result.gad7Severity === 'MINIMAL'
      ? 'Minimal Anxiety'
      : session.result.gad7Severity === 'MILD'
        ? 'Mild Anxiety'
        : session.result.gad7Severity === 'MODERATE'
          ? 'Moderate Anxiety'
          : 'Severe Anxiety'

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-light">
        <div className="container-results px-4 py-6">
          <h1 className="text-3xl font-display text-text-primary mb-2">
            Assessment Results
          </h1>
          <p className="text-sm text-text-secondary font-ui">
            {session.respondent.name || session.respondent.respondentCode} •{' '}
            {new Date(session.completedAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* Results */}
      <main className="container-results px-4 py-10">
        <div className="space-y-8">
          {/* Predominant Prakriti */}
          <div className="bg-bg-surface rounded-lg shadow-md p-8">
            <h2 className="text-xl font-display text-text-secondary mb-1">
              PREDOMINANT MANAS PRAKRITI
            </h2>
            <div className="mt-6">
              <div
                className="inline-block px-6 py-4 rounded-lg mb-3"
                style={{
                  backgroundColor: CATEGORY_COLORS[session.result.primaryCategory as keyof typeof CATEGORY_COLORS] + '20',
                  borderLeft: `4px solid ${CATEGORY_COLORS[session.result.primaryCategory as keyof typeof CATEGORY_COLORS]}`,
                }}
              >
                <div className="text-3xl font-display text-text-primary">
                  {getPrakritiFullName(session.result.predominantPrakriti)}
                </div>
                <div className="text-sm font-ui text-text-secondary mt-1">
                  {session.result.primaryCategory} Category
                </div>
                <div className="text-sm font-ui text-text-secondary mt-2">
                  Percentage Score:{' '}
                  <span className="font-600">
                    {(
                      session.result.subtypePercentages[
                        session.result.predominantPrakriti
                      ] || 0
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-ui text-text-secondary mb-2">
                  Secondary Influence
                </div>
                <div className="text-lg font-display text-text-primary">
                  {getPrakritiFullName(session.result.secondaryPrakriti)} (
                  {(
                    session.result.subtypePercentages[
                      session.result.secondaryPrakriti
                    ] || 0
                  ).toFixed(1)}
                  %)
                </div>
              </div>
            </div>
          </div>

          {/* Subtype Distribution Chart */}
          <div className="bg-bg-surface rounded-lg shadow-md p-8">
            <h2 className="text-xl font-display text-text-primary mb-6">
              Full Subtype Distribution
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                <Bar dataKey="value" fill="#3D6B4F" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        CATEGORY_COLORS[
                          entry.category as keyof typeof CATEGORY_COLORS
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* GAD-7 Result */}
          <div className="bg-bg-surface rounded-lg shadow-md p-8">
            <h2 className="text-xl font-display text-text-secondary mb-6">
              GAD-7 ANXIETY ASSESSMENT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor:
                    GAD7_SEVERITY_COLORS[
                      session.result.gad7Severity as keyof typeof GAD7_SEVERITY_COLORS
                    ] + '15',
                  borderLeft: `4px solid ${GAD7_SEVERITY_COLORS[session.result.gad7Severity as keyof typeof GAD7_SEVERITY_COLORS]}`,
                }}
              >
                <div className="text-sm font-ui text-text-secondary">
                  Total Score
                </div>
                <div className="text-4xl font-display text-text-primary mt-2">
                  {session.result.gad7Total}
                </div>
                <div className="text-sm font-ui text-text-secondary mt-2">
                  out of 21
                </div>
              </div>

              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor:
                    GAD7_SEVERITY_COLORS[
                      session.result.gad7Severity as keyof typeof GAD7_SEVERITY_COLORS
                    ] + '15',
                  borderLeft: `4px solid ${GAD7_SEVERITY_COLORS[session.result.gad7Severity as keyof typeof GAD7_SEVERITY_COLORS]}`,
                }}
              >
                <div className="text-sm font-ui text-text-secondary">
                  Severity Level
                </div>
                <div className="text-2xl font-display text-text-primary mt-2 font-600">
                  {severityLabel}
                </div>
                <div className="text-sm font-ui text-text-secondary mt-2">
                  Functional Impairment: {session.result.gad7Impairment}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Link
              href={`/results/${sessionId}/report`}
              className="px-6 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition"
            >
              Download PDF Report
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-bg-section text-text-primary font-ui font-600 rounded-lg hover:bg-border-light transition"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/assessment/setup"
              className="px-6 py-3 bg-bg-section text-text-primary font-ui font-600 rounded-lg hover:bg-border-light transition"
            >
              Start New Assessment
            </Link>
          </div>

          {/* Expandable Details */}
          <div className="bg-bg-surface rounded-lg shadow-md p-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-text-primary font-ui font-600 hover:text-primary-500 transition"
            >
              <span>{showDetails ? '▼' : '▶'}</span>
              Detailed Score Breakdown
            </button>
            {showDetails && (
              <div className="mt-6 space-y-3">
                {chartData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-bg-section rounded">
                    <span className="font-ui text-text-primary font-600">
                      {item.name}
                    </span>
                    <span className="text-text-secondary font-ui">
                      {item.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
