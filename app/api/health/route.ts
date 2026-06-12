import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const [itemData, sessionData] = await Promise.all([
      supabase.from('Item').select('count', { count: 'exact' }),
      supabase.from('Session').select('count', { count: 'exact' }),
    ])

    const itemCount = itemData.count || 0
    const sessionCount = sessionData.count || 0

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

