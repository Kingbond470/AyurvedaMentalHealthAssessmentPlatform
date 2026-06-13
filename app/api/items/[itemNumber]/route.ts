import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(
  _: NextRequest,
  { params }: { params: { itemNumber: string } }
) {
  const itemNumber = parseInt(params.itemNumber)
  if (isNaN(itemNumber) || itemNumber < 1 || itemNumber > 118) {
    return NextResponse.json({ error: 'Invalid item number' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .eq('item_number', itemNumber)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Map snake_case DB fields → camelCase for frontend
    const item = {
      id: data.id,
      itemNumber: data.item_number,
      section: data.section,
      sectionName: data.section_name,
      predictorSanskrit: data.predictor_sanskrit,
      predictorDevanagari: data.predictor_devanagari,
      interpretation: data.interpretation,
      isObserverRated: data.is_observer_rated,
      reverseScored: data.reverse_scored,
      mappedSubtypes: data.mapped_subtypes,
      coreProbeEn: data.core_probe_en,
      coreProbeHi: data.core_probe_hi,
      coreProbeMr: data.core_probe_mr,
      probe1QuestionEn: data.probe1_question_en,
      probe1QuestionHi: data.probe1_question_hi,
      probe1QuestionMr: data.probe1_question_mr,
      probe1Score0En: data.probe1_score0_en,
      probe1Score1En: data.probe1_score1_en,
      probe1Score2En: data.probe1_score2_en,
      probe1Score3En: data.probe1_score3_en,
      probe1Score4En: data.probe1_score4_en,
      probe1Score0Hi: data.probe1_score0_hi,
      probe1Score1Hi: data.probe1_score1_hi,
      probe1Score2Hi: data.probe1_score2_hi,
      probe1Score3Hi: data.probe1_score3_hi,
      probe1Score4Hi: data.probe1_score4_hi,
      probe1Score0Mr: data.probe1_score0_mr,
      probe1Score1Mr: data.probe1_score1_mr,
      probe1Score2Mr: data.probe1_score2_mr,
      probe1Score3Mr: data.probe1_score3_mr,
      probe1Score4Mr: data.probe1_score4_mr,
      probe2QuestionEn: data.probe2_question_en,
      probe2QuestionHi: data.probe2_question_hi,
      probe2QuestionMr: data.probe2_question_mr,
      probe2Score0En: data.probe2_score0_en,
      probe2Score1En: data.probe2_score1_en,
      probe2Score2En: data.probe2_score2_en,
      probe2Score3En: data.probe2_score3_en,
      probe2Score4En: data.probe2_score4_en,
      probe2Score0Hi: data.probe2_score0_hi,
      probe2Score1Hi: data.probe2_score1_hi,
      probe2Score2Hi: data.probe2_score2_hi,
      probe2Score3Hi: data.probe2_score3_hi,
      probe2Score4Hi: data.probe2_score4_hi,
      probe2Score0Mr: data.probe2_score0_mr,
      probe2Score1Mr: data.probe2_score1_mr,
      probe2Score2Mr: data.probe2_score2_mr,
      probe2Score3Mr: data.probe2_score3_mr,
      probe2Score4Mr: data.probe2_score4_mr,
      probe3QuestionEn: data.probe3_question_en,
      probe3QuestionHi: data.probe3_question_hi,
      probe3QuestionMr: data.probe3_question_mr,
      probe3Score0En: data.probe3_score0_en,
      probe3Score1En: data.probe3_score1_en,
      probe3Score2En: data.probe3_score2_en,
      probe3Score3En: data.probe3_score3_en,
      probe3Score4En: data.probe3_score4_en,
      probe3Score0Hi: data.probe3_score0_hi,
      probe3Score1Hi: data.probe3_score1_hi,
      probe3Score2Hi: data.probe3_score2_hi,
      probe3Score3Hi: data.probe3_score3_hi,
      probe3Score4Hi: data.probe3_score4_hi,
      probe3Score0Mr: data.probe3_score0_mr,
      probe3Score1Mr: data.probe3_score1_mr,
      probe3Score2Mr: data.probe3_score2_mr,
      probe3Score3Mr: data.probe3_score3_mr,
      probe3Score4Mr: data.probe3_score4_mr,
    }

    return NextResponse.json(item, { status: 200 })
  } catch (error) {
    console.error('Item fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}
