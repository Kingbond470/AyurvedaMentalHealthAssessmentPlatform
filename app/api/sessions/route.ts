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
    const { data, error } = await supabase
      .from('session')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

