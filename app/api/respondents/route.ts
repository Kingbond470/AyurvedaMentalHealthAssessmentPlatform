import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { respondentSchema } from '@/lib/schemas'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validated = respondentSchema.parse(body)

    const respondentCode =
      validated.respondentCode || `RESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const respondent = await prisma.respondent.create({
      data: {
        respondentCode,
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
    })

    return NextResponse.json(respondent, { status: 201 })
  } catch (error) {
    console.error('Respondent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create respondent' },
      { status: 400 }
    )
  }
}
