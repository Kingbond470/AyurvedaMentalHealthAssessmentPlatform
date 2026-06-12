// Auto-generated database types from Supabase schema

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum Language {
  EN = 'EN',
  HI = 'HI',
  MR = 'MR',
}

export enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum AssessmentPhase {
  MPPI = 'MPPI',
  GAD7 = 'GAD7',
  RESULTS = 'RESULTS',
}

export enum GAD7Severity {
  MINIMAL = 'MINIMAL',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
}

export interface Respondent {
  id: string;
  respondent_code: string;
  age: number;
  gender: Gender;
  education?: string | null;
  occupation?: string | null;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  language: Language;
  created_at: string;
}

export interface Session {
  id: string;
  respondent_id: string;
  practitioner_name: string;
  status: SessionStatus;
  phase: AssessmentPhase;
  started_at: string;
  completed_at?: string | null;
  last_activity_at: string;
  current_section: number;
  current_item: number;
  created_at: string;
  updated_at: string;
}

export interface ItemResponse {
  id: string;
  session_id: string;
  item_number: number;
  probe1_score: number;
  probe2_score: number;
  probe3_score: number;
  item_total: number;
  created_at: string;
  updated_at: string;
}

export interface GAD7Response {
  id: string;
  session_id: string;
  item1_score: number;
  item2_score: number;
  item3_score: number;
  item4_score: number;
  item5_score: number;
  item6_score: number;
  item7_score: number;
  impairment_score: number;
  total_score: number;
  severity: GAD7Severity;
  created_at: string;
  updated_at: string;
}

export interface SessionResult {
  id: string;
  session_id: string;
  subtype_raw_scores?: Record<string, number> | null;
  subtype_max_scores?: Record<string, number> | null;
  subtype_percentages: Record<string, number>;
  predominant_prakriti: string;
  secondary_prakriti: string;
  primary_category: string;
  gad7_total: number;
  gad7_severity: string;
  gad7_impairment: string;
  computed_at: string;
}

export interface Item {
  id: string;
  item_number: number;
  section: number;
  section_name: string;
  predictor_sanskrit: string;
  predictor_devanagari: string;
  interpretation: string;
  core_probe_en?: string | null;
  core_probe_hi?: string | null;
  core_probe_mr?: string | null;
  probe1_question_en?: string | null;
  probe1_question_hi?: string | null;
  probe1_question_mr?: string | null;
  probe1_score0_en?: string | null;
  probe1_score0_hi?: string | null;
  probe1_score0_mr?: string | null;
  probe1_score1_en?: string | null;
  probe1_score1_hi?: string | null;
  probe1_score1_mr?: string | null;
  probe1_score2_en?: string | null;
  probe1_score2_hi?: string | null;
  probe1_score2_mr?: string | null;
  probe1_score3_en?: string | null;
  probe1_score3_hi?: string | null;
  probe1_score3_mr?: string | null;
  probe1_score4_en?: string | null;
  probe1_score4_hi?: string | null;
  probe1_score4_mr?: string | null;
  probe2_question_en?: string | null;
  probe2_question_hi?: string | null;
  probe2_question_mr?: string | null;
  probe2_score0_en?: string | null;
  probe2_score0_hi?: string | null;
  probe2_score0_mr?: string | null;
  probe2_score1_en?: string | null;
  probe2_score1_hi?: string | null;
  probe2_score1_mr?: string | null;
  probe2_score2_en?: string | null;
  probe2_score2_hi?: string | null;
  probe2_score2_mr?: string | null;
  probe2_score3_en?: string | null;
  probe2_score3_hi?: string | null;
  probe2_score3_mr?: string | null;
  probe2_score4_en?: string | null;
  probe2_score4_hi?: string | null;
  probe2_score4_mr?: string | null;
  probe3_question_en?: string | null;
  probe3_question_hi?: string | null;
  probe3_question_mr?: string | null;
  probe3_score0_en?: string | null;
  probe3_score0_hi?: string | null;
  probe3_score0_mr?: string | null;
  probe3_score1_en?: string | null;
  probe3_score1_hi?: string | null;
  probe3_score1_mr?: string | null;
  probe3_score2_en?: string | null;
  probe3_score2_hi?: string | null;
  probe3_score2_mr?: string | null;
  probe3_score3_en?: string | null;
  probe3_score3_hi?: string | null;
  probe3_score3_mr?: string | null;
  probe3_score4_en?: string | null;
  probe3_score4_hi?: string | null;
  probe3_score4_mr?: string | null;
  mapped_subtypes?: string[] | null;
  is_observer_rated: boolean;
  section14_gender_variant?: string | null;
  reverse_scored: boolean;
  created_at: string;
  updated_at: string;
}

export interface GAD7Item {
  id: string;
  item_number: number;
  question_en: string;
  question_hi?: string | null;
  question_mr?: string | null;
  option0_en: string;
  option0_hi?: string | null;
  option0_mr?: string | null;
  option0_score: number;
  option1_en: string;
  option1_hi?: string | null;
  option1_mr?: string | null;
  option1_score: number;
  option2_en: string;
  option2_hi?: string | null;
  option2_mr?: string | null;
  option2_score: number;
  option3_en: string;
  option3_hi?: string | null;
  option3_mr?: string | null;
  option3_score: number;
  is_impairment_item: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubtypeConfig {
  id: string;
  subtype_code: string;
  full_name: string;
  category: string;
  total_items: number;
  max_score: number;
  created_at: string;
  updated_at: string;
}
