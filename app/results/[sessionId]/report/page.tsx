'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

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
  // Holds actual react-pdf components after manual client-side import
  const [pdf, setPdf] = useState<{ PDFDownloadLink: any; ReportPDFDocument: any } | null>(null)

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

  // Load react-pdf components after mount — cannot use next/dynamic because
  // PDFDownloadLink receives <Document> as a prop (not rendered by React),
  // so the dynamic wrapper breaks react-pdf's internal renderer.
  useEffect(() => {
    Promise.all([
      import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
      import('@/components/ReportPDFDocument').then((m) => m.default),
    ]).then(([PDFDownloadLink, ReportPDFDocument]) => {
      setPdf({ PDFDownloadLink, ReportPDFDocument })
    })
  }, [])

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
    <div className="min-h-screen bg-bg-primary p-3 sm:p-4">
      <div className="container-content mx-auto">
        <div className="bg-bg-surface rounded-lg shadow-md p-5 sm:p-8 text-center">
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

          {pdf ? (
            <pdf.PDFDownloadLink
              document={<pdf.ReportPDFDocument session={session} />}
              fileName={fileName}
              className="inline-block px-8 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition"
            >
              {({ loading: pdfLoading }: any) =>
                pdfLoading ? 'Building PDF...' : 'Download PDF Report'
              }
            </pdf.PDFDownloadLink>
          ) : (
            <span className="inline-block px-8 py-3 bg-primary-500/50 text-white font-ui font-600 rounded-lg cursor-wait">
              Preparing PDF...
            </span>
          )}

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
