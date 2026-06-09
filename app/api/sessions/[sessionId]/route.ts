import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  _: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        respondent: true,
        itemResponses: true,
        gad7Response: true,
        result: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(session, { status: 200 })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      status,
      currentSection,
      currentItem,
    } = body

    const updated = await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        ...(status && { status }),
        ...(currentSection !== undefined && { currentSection }),
        ...(currentItem !== undefined && { currentItem }),
        lastActivityAt: new Date(),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Session update error:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}
