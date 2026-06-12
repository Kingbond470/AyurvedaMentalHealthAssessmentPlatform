import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { itemResponseSchema } from '@/lib/schemas'

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string; itemNumber: string } }
) {
  try {
    const body = await request.json()
    const itemNumber = parseInt(params.itemNumber)

    const validated = itemResponseSchema.parse({
      itemNumber,
      probe1Score: body.probe1Score,
      probe2Score: body.probe2Score,
      probe3Score: body.probe3Score,
    })

    const itemTotal =
      validated.probe1Score +
      validated.probe2Score +
      validated.probe3Score

    const supabase = getSupabaseClient()

    // Check session exists
    const { data: session, error: sessionError } = await supabase
      .from('Session')
      .select('id')
      .eq('id', params.sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Upsert item response (insert or update)
    const { data: itemResponse, error: itemError } = await supabase
      .from('ItemResponse')
      .upsert(
        {
          session_id: params.sessionId,
          item_number: validated.itemNumber,
          probe1_score: validated.probe1Score,
          probe2_score: validated.probe2Score,
          probe3_score: validated.probe3Score,
          item_total: itemTotal,
        },
        { onConflict: 'session_id,item_number' }
      )
      .select()
      .single()

    if (itemError) throw itemError

    // Check if MPPI complete (item 118 is last)
    let phaseTransition = null
    if (validated.itemNumber === 118) {
      // Auto-transition to GAD-7
      await supabase.from('Session').update({
        phase: 'GAD7',
        current_item: 0,
        last_activity_at: new Date().toISOString(),
      }).eq('id', params.sessionId)
      phaseTransition = 'GAD7'
    } else {
      // Normal progression
      await supabase.from('Session').update({
        current_item: validated.itemNumber + 1,
        last_activity_at: new Date().toISOString(),
      }).eq('id', params.sessionId)
    }

    return NextResponse.json(
      {
        itemResponse,
        phaseTransition,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Item response error:', error)
    return NextResponse.json(
      { error: 'Failed to save item response' },
      { status: 500 }
    )
  }
}
