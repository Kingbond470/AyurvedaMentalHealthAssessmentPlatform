import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { gad7ResponseSchema } from '@/lib/schemas'
import { calculateGAD7Score, calculateSubtypeScores } from '@/lib/scoring'

function getImpairmentLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Not difficult at all'
    case 1:
      return 'Somewhat difficult'
    case 2:
      return 'Very difficult'
    case 3:
      return 'Extremely difficult'
    default:
      return 'Unknown'
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json()
    const validated = gad7ResponseSchema.parse(body)

    const itemScores = [
      validated.item1Score,
      validated.item2Score,
      validated.item3Score,
      validated.item4Score,
      validated.item5Score,
      validated.item6Score,
      validated.item7Score,
    ]

    const { total, severity } = calculateGAD7Score(itemScores)

    const supabase = getSupabaseClient()

    // Check session exists
    const { data: session, error: sessionError } = await supabase
      .from('session')
      .select('id')
      .eq('id', params.sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Upsert GAD-7 response
    const insertData: any = {
      session_id: params.sessionId,
      item1_score: validated.item1Score,
      item2_score: validated.item2Score,
      item3_score: validated.item3Score,
      item4_score: validated.item4Score,
      item5_score: validated.item5Score,
      item6_score: validated.item6Score,
      item7_score: validated.item7Score,
      total_score: total,
      severity,
    }

    if (validated.impairmentScore !== undefined) {
      insertData.impairment_score = validated.impairmentScore
    }

    const { data: gad7Response, error: gad7Error } = await supabase
      .from('gad7_response')
      .upsert(insertData, { onConflict: 'session_id' })
      .select()
      .single()

    if (gad7Error) throw gad7Error

    // Auto-trigger scoring when impairment is saved
    let autoScored = false
    if (validated.impairmentScore !== undefined && validated.impairmentScore !== null) {
      try {
        // Get all MPPI responses
        const { data: itemResponses, error: itemError } = await supabase
          .from('item_response')
          .select('*')
          .eq('session_id', params.sessionId)

        if (!itemError && itemResponses) {
          // Map snake_case DB fields → camelCase for scoring engine
          const mapped = itemResponses.map((r: any) => ({
            itemNumber: r.item_number,
            probe1Score: r.probe1_score,
            probe2Score: r.probe2_score,
            probe3Score: r.probe3_score,
          }))

          // Calculate MPPI scores
          const {
            subtypePercentages,
            predominantPrakriti,
            secondaryPrakriti,
            primaryCategory,
          } = calculateSubtypeScores(mapped)

          // Create SessionResult
          await supabase.from('session_result').upsert(
            {
              session_id: params.sessionId,
              subtype_percentages: subtypePercentages,
              predominant_prakriti: predominantPrakriti,
              secondary_prakriti: secondaryPrakriti,
              primary_category: primaryCategory,
              gad7_total: total,
              gad7_severity: severity,
              gad7_impairment: getImpairmentLabel(validated.impairmentScore),
            },
            { onConflict: 'session_id' }
          )
        }

        // Mark session COMPLETED
        await supabase.from('session').update({
          status: 'COMPLETED',
          phase: 'RESULTS',
          completed_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        }).eq('id', params.sessionId)

        autoScored = true
      } catch (scoringError) {
        console.error('Scoring error:', scoringError)
        // Still mark as completed even if scoring fails
        await supabase.from('session').update({
          status: 'COMPLETED',
          phase: 'RESULTS',
          completed_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        }).eq('id', params.sessionId)
        autoScored = true
      }
    } else {
      // Just update activity
      await supabase.from('session').update({
        last_activity_at: new Date().toISOString(),
      }).eq('id', params.sessionId)
    }

    return NextResponse.json(
      {
        gad7Response,
        autoScored,
        redirectTo: autoScored ? `/results/${params.sessionId}` : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GAD-7 response error:', error)
    return NextResponse.json(
      { error: 'Failed to save GAD-7 response' },
      { status: 500 }
    )
  }
}
