import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _: Request,
  { params }: { params: { itemNumber: string } }
) {
  try {
    const itemNumber = parseInt(params.itemNumber, 10)

    if (isNaN(itemNumber)) {
      return NextResponse.json(
        { error: 'Invalid item number' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('Item')
      .select('*')
      .eq('itemNumber', itemNumber)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
