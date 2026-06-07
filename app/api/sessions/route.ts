import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

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
    const { respondentCode, mppiOrder } = body

    if (!respondentCode) {
      return NextResponse.json(
        { error: 'Missing respondentCode' },
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
        practitionerId: payload.userId,
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
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const sessions = await prisma.session.findMany({
      where: { practitionerId: payload.userId },
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
