import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { itemResponseSchema } from '@/lib/schemas'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string; itemNumber: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const body = await request.json()
    const itemNumber = parseInt(params.itemNumber)

    const validated = itemResponseSchema.parse({
      itemNumber,
      probe1Score: body.probe1Score,
      probe2Score: body.probe2Score,
      probe3Score: body.probe3Score,
    })

    const itemTotal =
      validated.probe1Score +
      validated.probe2Score +
      validated.probe3Score

    const itemResponse = await prisma.itemResponse.upsert({
      where: {
        sessionId_itemNumber: {
          sessionId: params.sessionId,
          itemNumber: validated.itemNumber,
        },
      },
      create: {
        sessionId: params.sessionId,
        itemNumber: validated.itemNumber,
        probe1Score: validated.probe1Score,
        probe2Score: validated.probe2Score,
        probe3Score: validated.probe3Score,
        itemTotal,
      },
      update: {
        probe1Score: validated.probe1Score,
        probe2Score: validated.probe2Score,
        probe3Score: validated.probe3Score,
        itemTotal,
      },
    })

    // Check if MPPI complete (item 118 is last MPPI item)
    let phaseTransition = null
    if (validated.itemNumber === 118) {
      // Auto-transition to GAD-7
      await prisma.session.update({
        where: { id: params.sessionId },
        data: {
          phase: 'GAD7',
          currentItem: 0,
          lastActivityAt: new Date(),
        },
      })
      phaseTransition = 'GAD7'
    } else {
      // Normal item progression
      await prisma.session.update({
        where: { id: params.sessionId },
        data: {
          currentItem: validated.itemNumber + 1,
          lastActivityAt: new Date(),
        },
      })
    }

    return NextResponse.json(
      {
        itemResponse,
        phaseTransition,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Item response error:', error)
    return NextResponse.json(
      { error: 'Failed to save item response' },
      { status: 500 }
    )
  }
}
