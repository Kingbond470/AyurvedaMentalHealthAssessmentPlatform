import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(
  _: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = getSupabaseClient()

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('session')
      .select('*')
      .eq('id', params.sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch respondent using respondent_id from session
    const { data: respondentData } = await supabase
      .from('respondent')
      .select('*')
      .eq('id', session.respondent_id)
      .single()

    // Fetch result data if session is completed
    let resultData = null
    if (session.status === 'COMPLETED') {
      const { data: result } = await supabase
        .from('session_result')
        .select('*')
        .eq('session_id', params.sessionId)
        .single()
      resultData = result
    }

    return NextResponse.json({
      ...session,
      respondent: respondentData,
      result: resultData,
    }, { status: 200 })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json()
    const { status, currentSection, currentItem } = body

    const supabase = getSupabaseClient()

    const updateData: any = {
      last_activity_at: new Date().toISOString(),
    }
    if (status) updateData.status = status
    if (currentSection !== undefined) updateData.current_section = currentSection
    if (currentItem !== undefined) updateData.current_item = currentItem

    const { data, error } = await supabase
      .from('session')
      .update(updateData)
      .eq('id', params.sessionId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Session update error:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}
