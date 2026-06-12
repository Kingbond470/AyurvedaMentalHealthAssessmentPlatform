import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    const { data: items, error: itemsError, count } = await supabase
      .from('item')
      .select('item_number, predictor_sanskrit, section', { count: 'exact' })
      .order('item_number', { ascending: true })
      .limit(5)

    if (itemsError) throw itemsError

    return NextResponse.json({
      status: 'success',
      totalItemsInDatabase: count || 0,
      sampleItems: items?.map(i => ({
        itemNumber: i.item_number,
        predictor: i.predictor_sanskrit,
        section: i.section,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
      },
      { status: 500 }
    )
  }
}

