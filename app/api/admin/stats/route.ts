import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {

    const totalSessions = await prisma.session.count()
    const completedSessions = await prisma.session.count({
      where: { status: 'COMPLETED' },
    })
    const inProgressSessions = await prisma.session.count({
      where: { status: 'IN_PROGRESS' },
    })

    // Prakriti breakdown
    const results = await prisma.sessionResult.findMany()
    const prakritiBreaddown: Record<string, number> = {}
    results.forEach((result) => {
      if (!prakritiBreaddown[result.predominantPrakriti]) {
        prakritiBreaddown[result.predominantPrakriti] = 0
      }
      prakritiBreaddown[result.predominantPrakriti]++
    })

    // GAD-7 distribution
    const gad7Responses = await prisma.gAD7Response.findMany()
    const gad7Distribution: Record<string, number> = {
      MINIMAL: 0,
      MILD: 0,
      MODERATE: 0,
      SEVERE: 0,
    }
    gad7Responses.forEach((response) => {
      gad7Distribution[response.severity]++
    })

    return NextResponse.json(
      {
        totalSessions,
        completedSessions,
        inProgressSessions,
        prakritiBreaddown,
        gad7Distribution,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
