import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { gad7ResponseSchema } from '@/lib/schemas'
import { calculateGAD7Score, calculateSubtypeScores } from '@/lib/scoring'

const prisma = new PrismaClient()

function getImpairmentLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Not difficult at all'
    case 1:
      return 'Somewhat difficult'
    case 2:
      return 'Very difficult'
    case 3:
      return 'Extremely difficult'
    default:
      return 'Unknown'
  }
}

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

    // Auto-trigger scoring when impairment is saved (GAD-7 complete)
    let autoScored = false
    if (validated.impairmentScore !== undefined && validated.impairmentScore !== null) {
      try {
        // Get all MPPI responses for scoring
        const itemResponses = await prisma.itemResponse.findMany({
          where: { sessionId: params.sessionId },
        })

        // Calculate MPPI scores
        const {
          subtypeRawScores,
          subtypeMaxScores,
          subtypePercentages,
          predominantPrakriti,
          secondaryPrakriti,
          primaryCategory,
        } = calculateSubtypeScores(itemResponses)

        // Create result
        await prisma.sessionResult.upsert({
          where: { sessionId: params.sessionId },
          create: {
            sessionId: params.sessionId,
            subtypeRawScores,
            subtypeMaxScores,
            subtypePercentages,
            predominantPrakriti,
            secondaryPrakriti,
            primaryCategory,
            gad7Total: total,
            gad7Severity: severity,
            gad7Impairment: getImpairmentLabel(validated.impairmentScore),
          },
          update: {
            subtypeRawScores,
            subtypeMaxScores,
            subtypePercentages,
            predominantPrakriti,
            secondaryPrakriti,
            primaryCategory,
            gad7Total: total,
            gad7Severity: severity,
            gad7Impairment: getImpairmentLabel(validated.impairmentScore),
          },
        })

        // Mark session as COMPLETED and phase as RESULTS
        await prisma.session.update({
          where: { id: params.sessionId },
          data: {
            status: 'COMPLETED',
            phase: 'RESULTS',
            completedAt: new Date(),
            lastActivityAt: new Date(),
          },
        })

        autoScored = true
      } catch (scoringError) {
        console.error('Scoring error:', scoringError)
        // Still mark as completed even if scoring fails
        await prisma.session.update({
          where: { id: params.sessionId },
          data: {
            status: 'COMPLETED',
            phase: 'RESULTS',
            completedAt: new Date(),
            lastActivityAt: new Date(),
          },
        })
        autoScored = true
      }
    } else {
      // Just update activity
      await prisma.session.update({
        where: { id: params.sessionId },
        data: { lastActivityAt: new Date() },
      })
    }

    return NextResponse.json(
      {
        gad7Response,
        autoScored,
        redirectTo: autoScored ? `/results/${params.sessionId}` : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GAD-7 response error:', error)
    return NextResponse.json(
      { error: 'Failed to save GAD-7 response' },
      { status: 500 }
    )
  }
}
