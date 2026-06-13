import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { respondentCode, practitionerName } = body

    if (!respondentCode || !practitionerName) {
      return NextResponse.json(
        { error: 'Missing respondentCode or practitionerName' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Find respondent
    const { data: respondent, error: respondentError } = await supabase
      .from('respondent')
      .select('id')
      .eq('respondent_code', respondentCode)
      .single()

    if (respondentError || !respondent) {
      return NextResponse.json(
        { error: 'Respondent not found' },
        { status: 404 }
      )
    }

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('session')
      .insert([
        {
          respondent_id: respondent.id,
          practitioner_name: practitionerName,
          status: 'IN_PROGRESS',
          phase: 'MPPI',
          current_item: 1,
        },
      ])
      .select()
      .single()

    if (sessionError) throw sessionError

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(_: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    const { data: sessions, error } = await supabase
      .from('session')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!sessions?.length) return NextResponse.json([], { status: 200 })

    // Batch-fetch respondents and results to avoid N+1 and embedded-join FK issues
    const respondentIds = [...new Set(sessions.map((s: any) => s.respondent_id).filter(Boolean))]
    const sessionIds = sessions.map((s: any) => s.id)

    const [{ data: respondents }, { data: results }] = await Promise.all([
      supabase
        .from('respondent')
        .select('id, respondent_code, name, age, gender')
        .in('id', respondentIds),
      supabase
        .from('session_result')
        .select('session_id, predominant_prakriti, gad7_total, gad7_severity')
        .in('session_id', sessionIds),
    ])

    const respondentMap = new Map((respondents || []).map((r: any) => [r.id, r]))
    const resultMap = new Map((results || []).map((r: any) => [r.session_id, r]))

    const merged = sessions.map((session: any) => ({
      ...session,
      respondent: respondentMap.get(session.respondent_id) ?? null,
      result: resultMap.get(session.id) ?? null,
    }))

    return NextResponse.json(merged, { status: 200 })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

