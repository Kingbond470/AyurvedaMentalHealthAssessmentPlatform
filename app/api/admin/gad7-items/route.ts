import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('GAD7Item')
      .select('*')
      .order('itemNumber', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('GAD-7 items fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GAD-7 items', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('GAD7Item')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('GAD-7 item creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create GAD-7 item' },
      { status: 500 }
    )
  }
}

