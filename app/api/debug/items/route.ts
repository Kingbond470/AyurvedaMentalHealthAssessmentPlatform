import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      take: 5,
      orderBy: { itemNumber: 'asc' },
    })

    const totalCount = await prisma.item.count()

    return NextResponse.json({
      status: 'success',
      totalItemsInDatabase: totalCount,
      sampleItems: items.map(i => ({
        itemNumber: i.itemNumber,
        predictor: i.predictorSanskrit,
        section: i.section,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
      },
      { status: 500 }
    )
  }
}
