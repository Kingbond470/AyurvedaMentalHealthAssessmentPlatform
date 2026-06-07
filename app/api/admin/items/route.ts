import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const items = await prisma.item.findMany({
      orderBy: { itemNumber: 'asc' },
    })

    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error('Items fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const item = await prisma.item.create({
      data: {
        itemNumber: body.itemNumber,
        section: body.section,
        sectionName: body.sectionName,
        predictorSanskrit: body.predictorSanskrit,
        predictorDevanagari: body.predictorDevanagari,
        interpretation: body.interpretation,
        coreProbeEn: body.coreProbeEn,
        probe1QuestionEn: body.probe1QuestionEn,
        probe2QuestionEn: body.probe2QuestionEn,
        probe3QuestionEn: body.probe3QuestionEn,
        mappedSubtypes: body.mappedSubtypes || [],
        isObserverRated: body.isObserverRated || false,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Item creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
