import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const itemCount = await prisma.item.count()
    const sessionCount = await prisma.session.count()

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      items: itemCount,
      sessions: sessionCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
