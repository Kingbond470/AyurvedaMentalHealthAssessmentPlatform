import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(_: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Fetch all sessions with related data
    const { data: sessions, error: sessionsError } = await supabase
      .from('session')
      .select(`
        id,
        respondent_id,
        practitioner_name,
        created_at,
        completed_at,
        status,
        respondent:respondent_id(
          respondent_code,
          name,
          age,
          gender,
          education,
          phone,
          city,
          state,
          country
        )
      `)
      .order('created_at', { ascending: true })

    if (sessionsError) throw sessionsError

    // Fetch all item responses
    const { data: allItemResponses, error: itemsError } = await supabase
      .from('item_response')
      .select('session_id, item_number, item_total')

    if (itemsError) throw itemsError

    // Fetch all session results
    const { data: allResults, error: resultsError } = await supabase
      .from('session_result')
      .select('session_id, predominant_prakriti, secondary_prakriti, primary_category, gad7_total, gad7_severity, gad7_impairment')

    if (resultsError) throw resultsError

    // Create lookup maps
    const itemResponsesBySession = new Map()
    allItemResponses?.forEach(ir => {
      if (!itemResponsesBySession.has(ir.session_id)) {
        itemResponsesBySession.set(ir.session_id, [])
      }
      itemResponsesBySession.get(ir.session_id).push(ir)
    })

    const resultsBySession = new Map()
    allResults?.forEach(r => {
      resultsBySession.set(r.session_id, r)
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

    sessions?.forEach((session: any) => {
      const itemScores: number[] = new Array(118).fill(0)
      const itemResponses = itemResponsesBySession.get(session.id) || []
      itemResponses.forEach((ir: any) => {
        itemScores[ir.item_number - 1] = ir.item_total || 0
      })

      const result = resultsBySession.get(session.id)
      const respondent = Array.isArray(session.respondent) ? session.respondent[0] : session.respondent

      const row = [
        session.id,
        respondent?.respondent_code || '',
        respondent?.name || '',
        respondent?.age || '',
        respondent?.gender || '',
        respondent?.education || '',
        respondent?.phone || '',
        respondent?.city || '',
        respondent?.state || '',
        respondent?.country || '',
        session.practitioner_name,
        new Date(session.completed_at || session.created_at).toISOString(),
        session.status,
        result?.predominant_prakriti || '',
        result?.secondary_prakriti || '',
        result?.primary_category || '',
        result?.gad7_total || '',
        result?.gad7_severity || '',
        result?.gad7_impairment || '',
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

