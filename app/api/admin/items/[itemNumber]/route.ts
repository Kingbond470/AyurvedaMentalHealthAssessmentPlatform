import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  _: Request,
  { params }: { params: { itemNumber: string } }
) {
  try {
    const itemNumber = parseInt(params.itemNumber, 10)

    if (isNaN(itemNumber)) {
      return NextResponse.json(
        { error: 'Invalid item number' },
        { status: 400 }
      )
    }

    const item = await prisma.item.findUnique({
      where: { itemNumber },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
