import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(
  _: NextRequest,
  { params }: { params: { itemNumber: string } }
) {
  const itemNumber = parseInt(params.itemNumber)
  if (isNaN(itemNumber) || itemNumber < 1 || itemNumber > 118) {
    return NextResponse.json({ error: 'Invalid item number' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseClient()
    // 'Item' (PascalCase) table has camelCase columns and real content — admin editor uses same table
    const { data, error } = await supabase
      .from('Item')
      .select('*')
      .eq('itemNumber', itemNumber)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Item fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}
