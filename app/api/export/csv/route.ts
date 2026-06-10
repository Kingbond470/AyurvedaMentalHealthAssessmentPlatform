import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest) {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        respondent: true,
        itemResponses: true,
        gad7Response: true,
        result: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Build CSV header
    const headers = [
      'Session ID',
      'Respondent Code',
      'Respondent Name',
      'Age',
      'Gender',
      'Education',
      'Phone',
      'City',
      'State',
      'Country',
      'Practitioner Name',
      'Assessment Date',
      'Status',
      'Predominant Prakriti',
      'Secondary Prakriti',
      'Primary Category',
      'GAD-7 Total Score',
      'GAD-7 Severity',
      'GAD-7 Impairment',
    ]

    // Add item response columns
    for (let i = 1; i <= 118; i++) {
      headers.push(`Item ${i} Score`)
    }

    // Build CSV rows
    const rows: string[] = []
    rows.push(headers.map((h) => `"${h}"`).join(','))

    sessions.forEach((session) => {
      const itemScores: number[] = new Array(118).fill(0)
      session.itemResponses.forEach((ir) => {
        itemScores[ir.itemNumber - 1] = ir.itemTotal || 0
      })

      const row = [
        session.id,
        session.respondent.respondentCode,
        session.respondent.name || '',
        session.respondent.age || '',
        session.respondent.gender || '',
        session.respondent.education || '',
        session.respondent.phone || '',
        session.respondent.city || '',
        session.respondent.state || '',
        session.respondent.country || '',
        session.practitionerName,
        new Date(session.completedAt || session.createdAt).toISOString(),
        session.status,
        session.result?.predominantPrakriti || '',
        session.result?.secondaryPrakriti || '',
        session.result?.primaryCategory || '',
        session.result?.gad7Total || '',
        session.result?.gad7Severity || '',
        session.result?.gad7Impairment || '',
        ...itemScores.map((s) => s.toString()),
      ]

      rows.push(row.map((v) => `"${v}"`).join(','))
    })

    const csv = rows.join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition':
          `attachment; filename="mpaap-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    )
  }
}

