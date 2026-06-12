import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(_: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Get all sessions for counting
    const { data: allSessions, error: sessionsError } = await supabase
      .from('session')
      .select('id, status')

    if (sessionsError) throw sessionsError

    const sessions = allSessions || []
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length
    const inProgressSessions = sessions.filter(s => s.status === 'IN_PROGRESS').length

    // Prakriti breakdown
    const { data: results, error: resultsError } = await supabase
      .from('session_result')
      .select('predominant_prakriti')

    if (resultsError) throw resultsError

    const prakritiBreaddown: Record<string, number> = {}
    results?.forEach((result) => {
      if (!prakritiBreaddown[result.predominant_prakriti]) {
        prakritiBreaddown[result.predominant_prakriti] = 0
      }
      prakritiBreaddown[result.predominant_prakriti]++
    })

    // GAD-7 distribution
    const { data: gad7Responses, error: gad7Error } = await supabase
      .from('gad7_response')
      .select('severity')

    if (gad7Error) throw gad7Error

    const gad7Distribution: Record<string, number> = {
      MINIMAL: 0,
      MILD: 0,
      MODERATE: 0,
      SEVERE: 0,
    }
    gad7Responses?.forEach((response) => {
      gad7Distribution[response.severity]++
    })

    return NextResponse.json(
      {
        totalSessions,
        completedSessions,
        inProgressSessions,
        prakritiBreaddown,
        gad7Distribution,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

