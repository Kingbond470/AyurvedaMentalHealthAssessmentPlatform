'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer'
import { getPrakritiFullName, ALL_SUBTYPES } from '@/lib/scoring'

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
    subtypeRawScores: Record<string, number>
    subtypeMaxScores: Record<string, number>
    gad7Total: number
    gad7Severity: string
    gad7Impairment: string
  }
  completedAt: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #3D6B4F',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A18',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#5A5A55',
    marginBottom: 3,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D6B4F',
    marginBottom: 10,
    borderBottom: '1px solid #E0DDD5',
    paddingBottom: 5,
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: '120px',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#5A5A55',
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
    color: '#1A1A18',
  },
  resultBox: {
    padding: 15,
    backgroundColor: '#F5F2EC',
    borderLeftWidth: 3,
    borderLeftColor: '#3D6B4F',
    marginBottom: 15,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A18',
    marginTop: 5,
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '1px solid #E0DDD5',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#F5F2EC',
    padding: 5,
  },
  tableCol1: {
    width: '40%',
    fontSize: 10,
  },
  tableCol2: {
    width: '30%',
    fontSize: 10,
  },
  tableCol3: {
    width: '30%',
    fontSize: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1px solid #E0DDD5',
    fontSize: 8,
    color: '#8A8A82',
  },
})

const ReportPDF = ({ session }: { session: SessionData }) => {
  const subtypeData = ALL_SUBTYPES.map((subtype) => ({
    name: subtype,
    percentage: (session.result.subtypePercentages[subtype] || 0).toFixed(1),
    raw: session.result.subtypeRawScores[subtype] || 0,
    max: session.result.subtypeMaxScores[subtype] || 0,
  })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Manas Prakriti & Anxiety Assessment Report
          </Text>
          <Text style={styles.subtitle}>
            Respondent: {session.respondent.name || session.respondent.respondentCode}
          </Text>
          <Text style={styles.subtitle}>
            Date: {new Date(session.completedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Respondent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Respondent Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID</Text>
            <Text style={styles.infoValue}>
              {session.respondent.respondentCode}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{session.respondent.age || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>
              {session.respondent.gender || '—'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Education</Text>
            <Text style={styles.infoValue}>
              {session.respondent.education || '—'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {[session.respondent.city, session.respondent.state, session.respondent.country]
                .filter(Boolean)
                .join(', ') || '—'}
            </Text>
          </View>
        </View>

        {/* Manas Prakriti Result */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manas Prakriti Profile</Text>
          <View style={styles.resultBox}>
            <Text style={styles.subtitle}>Predominant Prakriti</Text>
            <Text style={styles.resultValue}>
              {getPrakritiFullName(session.result.predominantPrakriti)}
            </Text>
            <Text style={styles.subtitle}>Category: {session.result.primaryCategory}</Text>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.subtitle}>Secondary Influence</Text>
            <Text style={styles.resultValue}>
              {getPrakritiFullName(session.result.secondaryPrakriti)}
            </Text>
          </View>

          {/* Subtype Scores Table */}
          <Text style={styles.sectionTitle}>All Subtype Scores</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCol1, { fontWeight: 'bold' }]}>
                Subtype
              </Text>
              <Text style={[styles.tableCol2, { fontWeight: 'bold' }]}>
                Score
              </Text>
              <Text style={[styles.tableCol3, { fontWeight: 'bold' }]}>
                Percentage
              </Text>
            </View>
            {subtypeData.map((item) => (
              <View key={item.name} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{item.name}</Text>
                <Text style={styles.tableCol2}>
                  {item.raw} / {item.max}
                </Text>
                <Text style={styles.tableCol3}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* GAD-7 Result */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GAD-7 Anxiety Assessment</Text>
          <View style={styles.resultBox}>
            <Text style={styles.subtitle}>Total Score</Text>
            <Text style={styles.resultValue}>{session.result.gad7Total} / 21</Text>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.subtitle}>Severity Level</Text>
            <Text style={styles.resultValue}>{session.result.gad7Severity}</Text>
            <Text style={styles.subtitle}>
              Functional Impairment: {session.result.gad7Impairment}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This report is confidential and intended for research and clinical use only.
          </Text>
          <Text>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default function ReportPage() {
  const params = useParams()

  const sessionId = params.sessionId as string
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <p className="text-text-secondary font-body">Generating report...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="container-content mx-auto">
        <div className="bg-bg-surface rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-display text-text-primary mb-4">
            Download Assessment Report
          </h1>
          <p className="text-text-secondary font-ui mb-8">
            {session.respondent.name || session.respondent.respondentCode}
          </p>

          <PDFDownloadLink
            document={<ReportPDF session={session} />}
            fileName={`MPAAP-Report-${session.respondent.respondentCode}-${new Date().toISOString().split('T')[0]}.pdf`}
            className="inline-block px-8 py-3 bg-primary-500 text-white font-ui font-600 rounded-lg hover:bg-primary-600 transition"
          >
            Download PDF Report
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
