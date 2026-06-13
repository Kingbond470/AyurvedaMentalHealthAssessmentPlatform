'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import axios from 'axios'
// react-pdf is browser-only — dynamically imported to avoid SSR crash
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PDFDownloadLink = dynamic<any>(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Preparing PDF...</span> }
)

const ReportPDFDocument = dynamic(
  () => import('@/components/ReportPDFDocument'),
  { ssr: false }
)

interface SessionData {
  id: string
  respondent: {
    respondentCode: string
    name?: string
    age?: number
    gender?: string
    education?: string
    city?: string
    state?: string
    country?: string
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

export default function ReportPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recalculating, setRecalculating] = useState(false)

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/api/sessions/${sessionId}`)
      if (!response.data?.result) {
        setError('Results not yet computed for this session')
        return
      }
      setSession(response.data)
    } catch (err) {
      setError('Failed to load session data')
      console.error('Failed to fetch session:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const handleRecalculate = async () => {
    setRecalculating(true)
    setError(null)
    try {
      await axios.post(`/api/sessions/${sessionId}/calculate`)
      setLoading(true)
      await fetchSession()
    } catch (err) {
      setError('Failed to compute results')
      console.error('Recalculate failed:', err)
    } finally {
      setRecalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <p className="text-text-secondary font-body">Loading report...</p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-body">{error || 'Session not found'}</p>
          {error?.includes('not yet computed') && (
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-6 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
            >
              {recalculating ? 'Computing...' : 'Compute Results'}
            </button>
          )}
          <div>
            <a
              href={`/results/${sessionId}`}
              className="px-6 py-2 bg-bg-section text-text-primary font-ui rounded hover:bg-border-light transition"
            >
              Back to Results
            </a>
          </div>
        </div>
      </div>
    )
  }

  const fileName = `MPAAP-Report-${session.respondent.respondentCode}-${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="container-content mx-auto">
        <div className="bg-bg-surface rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-display text-text-primary mb-4">
            Download Assessment Report
          </h1>
          <p className="text-text-secondary font-ui mb-2">
            {session.respondent.name || session.respondent.respondentCode}
          </p>
          <p className="text-sm text-text-tertiary font-ui mb-8">
            {session.completedAt
              ? new Date(session.completedAt).toLocaleDateString()
              : ''}
          </p>

          <PDFDownloadLink
            document={<ReportPDFDocument session={session} />}
            fileName={fileName}
            className="inline-block px-8 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition"
          >
            {({ loading: pdfLoading }: any) =>
              pdfLoading ? 'Building PDF...' : 'Download PDF Report'
            }
          </PDFDownloadLink>

          <div className="mt-8">
            <a
              href={`/results/${sessionId}`}
              className="inline-block px-6 py-2 bg-bg-section text-text-primary font-ui rounded hover:bg-border-light transition"
            >
              Back to Results
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
