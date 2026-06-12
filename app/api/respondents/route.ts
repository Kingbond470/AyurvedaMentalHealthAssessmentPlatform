import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { respondentSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = respondentSchema.parse(body)

    const respondentCode =
      validated.respondentCode || `RESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('Respondent')
      .insert([
        {
          respondent_code: respondentCode,
          age: validated.age,
          gender: validated.gender,
          education: validated.education,
          occupation: validated.occupation,
          name: validated.name,
          phone: validated.phone,
          city: validated.city,
          state: validated.state,
          country: validated.country,
          language: validated.language,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Respondent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create respondent' },
      { status: 400 }
    )
  }
}

