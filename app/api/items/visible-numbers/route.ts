import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

// Returns sorted list of visible MPPI item numbers (1-118)
// Used by AssessmentInterface for navigation and progress tracking
export async function GET(_: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('Item')
      .select('itemNumber')
      .eq('isVisible', true)
      .lte('itemNumber', 118)
      .order('itemNumber', { ascending: true })

    if (error || !data || data.length === 0) {
      // Fallback: all 118 items visible (column may not exist yet or all visible)
      return NextResponse.json(Array.from({ length: 118 }, (_, i) => i + 1))
    }

    return NextResponse.json(data.map((d: any) => d.itemNumber))
  } catch {
    return NextResponse.json(Array.from({ length: 118 }, (_, i) => i + 1))
  }
}
