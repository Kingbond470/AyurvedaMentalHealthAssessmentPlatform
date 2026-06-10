import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.gAD7Item.findMany({
      orderBy: { itemNumber: 'asc' },
    })

    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error('GAD-7 items fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GAD-7 items', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = await prisma.gAD7Item.create({
      data: {
        itemNumber: body.itemNumber,
        questionEn: body.questionEn,
        questionHi: body.questionHi,
        questionMr: body.questionMr,
        option0En: body.option0En,
        option0Hi: body.option0Hi,
        option0Mr: body.option0Mr,
        option1En: body.option1En,
        option1Hi: body.option1Hi,
        option1Mr: body.option1Mr,
        option2En: body.option2En,
        option2Hi: body.option2Hi,
        option2Mr: body.option2Mr,
        option3En: body.option3En,
        option3Hi: body.option3Hi,
        option3Mr: body.option3Mr,
        isImpairmentItem: body.isImpairmentItem || false,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('GAD-7 item creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create GAD-7 item' },
      { status: 500 }
    )
  }
}

