import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

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

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('GAD7Item')
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

export async function PUT(
  request: Request,
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

    const body = await request.json()
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('GAD7Item')
      .update(body)
      .eq('itemNumber', itemNumber)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update item' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
