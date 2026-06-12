import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import {
  calculateSubtypeScores,
  calculateGAD7Score,
} from '@/lib/scoring'

export async function POST(
  _: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = getSupabaseClient()

    // Get session with responses
    const [{ data: session }, { data: itemResponses }, { data: gad7Response }] = await Promise.all([
      supabase
        .from('Session')
        .select('*')
        .eq('id', params.sessionId)
        .single(),
      supabase
        .from('ItemResponse')
        .select('*')
        .eq('session_id', params.sessionId),
      supabase
        .from('GAD7Response')
        .select('*')
        .eq('session_id', params.sessionId)
        .single(),
    ])

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate MPPI scores
    const mppiScores = calculateSubtypeScores(
      (itemResponses || []).map((ir: any) => ({
        itemNumber: ir.item_number,
        probe1Score: ir.probe1_score,
        probe2Score: ir.probe2_score,
        probe3Score: ir.probe3_score,
      }))
    )

    // Calculate GAD-7 scores
    let gad7Result: any = {
      total: 0,
      severity: 'MINIMAL',
      impairment: 'Not difficult',
    }

    if (gad7Response) {
      const gad7Scores = [
        gad7Response.item1_score,
        gad7Response.item2_score,
        gad7Response.item3_score,
        gad7Response.item4_score,
        gad7Response.item5_score,
        gad7Response.item6_score,
        gad7Response.item7_score,
      ]

      const gad7Calc = calculateGAD7Score(gad7Scores)
      const impairmentMap: any = {
        0: 'Not difficult',
        1: 'Somewhat difficult',
        2: 'Very difficult',
        3: 'Extremely difficult',
      }

      gad7Result = {
        total: gad7Calc.total,
        severity: gad7Calc.severity,
        impairment: impairmentMap[gad7Response.impairment_score] || 'Unknown',
      }
    }

    // Create or update session result
    const { data: result, error: resultError } = await supabase
      .from('SessionResult')
      .upsert(
        {
          session_id: params.sessionId,
          subtype_percentages: mppiScores.subtypePercentages,
          predominant_prakriti: mppiScores.predominantPrakriti,
          secondary_prakriti: mppiScores.secondaryPrakriti,
          primary_category: mppiScores.primaryCategory,
          gad7_total: gad7Result.total,
          gad7_severity: gad7Result.severity,
          gad7_impairment: gad7Result.impairment,
        },
        { onConflict: 'session_id' }
      )
      .select()
      .single()

    if (resultError) throw resultError

    // Mark session as completed
    await supabase.from('Session').update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    }).eq('id', params.sessionId)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate results' },
      { status: 500 }
    )
  }
}
