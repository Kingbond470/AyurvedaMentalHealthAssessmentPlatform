import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(_: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .order('item_number', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('Items fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('item')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Item creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}

