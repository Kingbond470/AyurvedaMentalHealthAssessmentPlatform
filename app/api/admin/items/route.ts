import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('Item')
      .select('*')
      .order('itemNumber', { ascending: true })

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
    const { data, error } = await supabase
      .from('Item')
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

