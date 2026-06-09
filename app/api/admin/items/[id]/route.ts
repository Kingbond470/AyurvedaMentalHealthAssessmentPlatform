import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemNumber = parseInt(params.id)
    const item = await prisma.item.findUnique({
      where: { itemNumber },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemNumber = parseInt(params.id)
    const body = await req.json()

    const item = await prisma.item.update({
      where: { itemNumber },
      data: {
        section: body.section,
        sectionName: body.sectionName,
        predictorSanskrit: body.predictorSanskrit,
        predictorDevanagari: body.predictorDevanagari,
        interpretation: body.interpretation,
        coreProbeEn: body.coreProbeEn,
        coreProbeHi: body.coreProbeHi,
        coreProbeMr: body.coreProbeMr,
        probe1QuestionEn: body.probe1QuestionEn,
        probe1QuestionHi: body.probe1QuestionHi,
        probe1QuestionMr: body.probe1QuestionMr,
        probe1Score0En: body.probe1Score0En,
        probe1Score1En: body.probe1Score1En,
        probe1Score2En: body.probe1Score2En,
        probe1Score3En: body.probe1Score3En,
        probe1Score4En: body.probe1Score4En,
        probe2QuestionEn: body.probe2QuestionEn,
        probe2QuestionHi: body.probe2QuestionHi,
        probe2QuestionMr: body.probe2QuestionMr,
        probe2Score0En: body.probe2Score0En,
        probe2Score1En: body.probe2Score1En,
        probe2Score2En: body.probe2Score2En,
        probe2Score3En: body.probe2Score3En,
        probe2Score4En: body.probe2Score4En,
        probe3QuestionEn: body.probe3QuestionEn,
        probe3QuestionHi: body.probe3QuestionHi,
        probe3QuestionMr: body.probe3QuestionMr,
        probe3Score0En: body.probe3Score0En,
        probe3Score1En: body.probe3Score1En,
        probe3Score2En: body.probe3Score2En,
        probe3Score3En: body.probe3Score3En,
        probe3Score4En: body.probe3Score4En,
        mappedSubtypes: body.mappedSubtypes || [],
        isObserverRated: body.isObserverRated || false,
      },
    })

    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update item' },
      { status: 500 }
    )
  }
}
