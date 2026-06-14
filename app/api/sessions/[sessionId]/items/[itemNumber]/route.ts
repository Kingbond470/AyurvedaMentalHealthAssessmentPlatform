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
      .from('session')
      .select('id')
      .eq('id', params.sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Upsert item response (insert or update)
    const { data: itemResponse, error: itemError } = await supabase
      .from('item_response')
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

    // Find last visible MPPI item dynamically (accounts for hidden items)
    const { data: lastVisibleRows } = await supabase
      .from('Item')
      .select('itemNumber')
      .eq('isVisible', true)
      .lte('itemNumber', 118)
      .order('itemNumber', { ascending: false })
      .limit(1)

    const lastVisibleItem = lastVisibleRows?.[0]?.itemNumber ?? 118

    let phaseTransition = null
    if (validated.itemNumber === lastVisibleItem) {
      // Auto-transition to GAD-7
      await supabase.from('session').update({
        phase: 'GAD7',
        current_item: 0,
        last_activity_at: new Date().toISOString(),
      }).eq('id', params.sessionId)
      phaseTransition = 'GAD7'
    } else {
      // Normal progression — frontend uses visible-numbers list for next item
      await supabase.from('session').update({
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
