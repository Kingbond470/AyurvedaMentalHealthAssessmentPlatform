import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { gad7ResponseSchema } from '@/lib/schemas'
import { calculateGAD7Score } from '@/lib/scoring'

const prisma = new PrismaClient()

export async function PUT(
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
    const validated = gad7ResponseSchema.parse(body)

    const itemScores = [
      validated.item1Score,
      validated.item2Score,
      validated.item3Score,
      validated.item4Score,
      validated.item5Score,
      validated.item6Score,
      validated.item7Score,
    ]

    const { total, severity } = calculateGAD7Score(itemScores)

    const gad7Response = await prisma.gAD7Response.upsert({
      where: { sessionId: params.sessionId },
      create: {
        sessionId: params.sessionId,
        item1Score: validated.item1Score,
        item2Score: validated.item2Score,
        item3Score: validated.item3Score,
        item4Score: validated.item4Score,
        item5Score: validated.item5Score,
        item6Score: validated.item6Score,
        item7Score: validated.item7Score,
        impairmentScore: validated.impairmentScore,
        totalScore: total,
        severity,
      },
      update: {
        item1Score: validated.item1Score,
        item2Score: validated.item2Score,
        item3Score: validated.item3Score,
        item4Score: validated.item4Score,
        item5Score: validated.item5Score,
        item6Score: validated.item6Score,
        item7Score: validated.item7Score,
        impairmentScore: validated.impairmentScore,
        totalScore: total,
        severity,
      },
    })

    await prisma.session.update({
      where: { id: params.sessionId },
      data: { lastActivityAt: new Date() },
    })

    return NextResponse.json(gad7Response, { status: 200 })
  } catch (error) {
    console.error('GAD-7 response error:', error)
    return NextResponse.json(
      { error: 'Failed to save GAD-7 response' },
      { status: 500 }
    )
  }
}
