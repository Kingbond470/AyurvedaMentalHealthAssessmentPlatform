import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import {
  calculateSubtypeScores,
  calculateGAD7Score,
  PRAKRITI_CATEGORY,
} from '@/lib/scoring'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        itemResponses: true,
        gad7Response: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.practitionerId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate MPPI scores
    const mppiScores = calculateSubtypeScores(
      session.itemResponses.map((ir) => ({
        itemNumber: ir.itemNumber,
        probe1Score: ir.probe1Score,
        probe2Score: ir.probe2Score,
        probe3Score: ir.probe3Score,
      }))
    )

    // Calculate GAD-7 scores
    let gad7Result = {
      total: 0,
      severity: 'MINIMAL' as const,
      impairment: 'Not difficult',
    }

    if (session.gad7Response) {
      const gad7Scores = [
        session.gad7Response.item1Score,
        session.gad7Response.item2Score,
        session.gad7Response.item3Score,
        session.gad7Response.item4Score,
        session.gad7Response.item5Score,
        session.gad7Response.item6Score,
        session.gad7Response.item7Score,
      ]

      const gad7Calc = calculateGAD7Score(gad7Scores)
      const impairmentMap = {
        0: 'Not difficult',
        1: 'Somewhat difficult',
        2: 'Very difficult',
        3: 'Extremely difficult',
      }

      gad7Result = {
        total: gad7Calc.total,
        severity: gad7Calc.severity,
        impairment:
          impairmentMap[
            session.gad7Response.impairmentScore as keyof typeof impairmentMap
          ] || 'Unknown',
      }
    }

    // Create or update session result
    const result = await prisma.sessionResult.upsert({
      where: { sessionId: params.sessionId },
      create: {
        sessionId: params.sessionId,
        subtypeRawScores: mppiScores.subtypeRawScores,
        subtypeMaxScores: mppiScores.subtypeMaxScores,
        subtypePercentages: mppiScores.subtypePercentages,
        predominantPrakriti: mppiScores.predominantPrakriti,
        secondaryPrakriti: mppiScores.secondaryPrakriti,
        primaryCategory: mppiScores.primaryCategory,
        gad7Total: gad7Result.total,
        gad7Severity: gad7Result.severity,
        gad7Impairment: gad7Result.impairment,
      },
      update: {
        subtypeRawScores: mppiScores.subtypeRawScores,
        subtypeMaxScores: mppiScores.subtypeMaxScores,
        subtypePercentages: mppiScores.subtypePercentages,
        predominantPrakriti: mppiScores.predominantPrakriti,
        secondaryPrakriti: mppiScores.secondaryPrakriti,
        primaryCategory: mppiScores.primaryCategory,
        gad7Total: gad7Result.total,
        gad7Severity: gad7Result.severity,
        gad7Impairment: gad7Result.impairment,
      },
    })

    // Mark session as completed
    await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate results' },
      { status: 500 }
    )
  }
}
