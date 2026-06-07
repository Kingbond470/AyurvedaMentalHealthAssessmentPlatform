import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { respondentCode, practitionerName, mppiOrder } = body

    if (!respondentCode || !practitionerName) {
      return NextResponse.json(
        { error: 'Missing respondentCode or practitionerName' },
        { status: 400 }
      )
    }

    const respondent = await prisma.respondent.findUnique({
      where: { respondentCode },
    })

    if (!respondent) {
      return NextResponse.json(
        { error: 'Respondent not found' },
        { status: 404 }
      )
    }

    const session = await prisma.session.create({
      data: {
        respondentId: respondent.id,
        practitionerName,
        status: 'IN_PROGRESS',
        mppiOrder: mppiOrder || 'BEFORE_GAD7',
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        respondent: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(sessions, { status: 200 })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
