-- Create Item table (question bank)

CREATE TABLE item (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  item_number INT NOT NULL UNIQUE,
  section INT NOT NULL,
  section_name TEXT NOT NULL,

  predictor_sanskrit TEXT NOT NULL,
  predictor_devanagari TEXT NOT NULL,
  interpretation TEXT NOT NULL,

  -- Core probe translations (nullable - fallback to EN)
  core_probe_en TEXT,
  core_probe_hi TEXT,
  core_probe_mr TEXT,

  -- Probe 1 translations (nullable - fallback to EN)
  probe1_question_en TEXT,
  probe1_question_hi TEXT,
  probe1_question_mr TEXT,
  probe1_score0_en TEXT,
  probe1_score0_hi TEXT,
  probe1_score0_mr TEXT,
  probe1_score1_en TEXT,
  probe1_score1_hi TEXT,
  probe1_score1_mr TEXT,
  probe1_score2_en TEXT,
  probe1_score2_hi TEXT,
  probe1_score2_mr TEXT,
  probe1_score3_en TEXT,
  probe1_score3_hi TEXT,
  probe1_score3_mr TEXT,
  probe1_score4_en TEXT,
  probe1_score4_hi TEXT,
  probe1_score4_mr TEXT,

  -- Probe 2 translations (nullable - fallback to EN)
  probe2_question_en TEXT,
  probe2_question_hi TEXT,
  probe2_question_mr TEXT,
  probe2_score0_en TEXT,
  probe2_score0_hi TEXT,
  probe2_score0_mr TEXT,
  probe2_score1_en TEXT,
  probe2_score1_hi TEXT,
  probe2_score1_mr TEXT,
  probe2_score2_en TEXT,
  probe2_score2_hi TEXT,
  probe2_score2_mr TEXT,
  probe2_score3_en TEXT,
  probe2_score3_hi TEXT,
  probe2_score3_mr TEXT,
  probe2_score4_en TEXT,
  probe2_score4_hi TEXT,
  probe2_score4_mr TEXT,

  -- Probe 3 translations (nullable - fallback to EN)
  probe3_question_en TEXT,
  probe3_question_hi TEXT,
  probe3_question_mr TEXT,
  probe3_score0_en TEXT,
  probe3_score0_hi TEXT,
  probe3_score0_mr TEXT,
  probe3_score1_en TEXT,
  probe3_score1_hi TEXT,
  probe3_score1_mr TEXT,
  probe3_score2_en TEXT,
  probe3_score2_hi TEXT,
  probe3_score2_mr TEXT,
  probe3_score3_en TEXT,
  probe3_score3_hi TEXT,
  probe3_score3_mr TEXT,
  probe3_score4_en TEXT,
  probe3_score4_hi TEXT,
  probe3_score4_mr TEXT,

  mapped_subtypes TEXT[] DEFAULT '{}',
  is_observer_rated BOOLEAN NOT NULL DEFAULT false,
  section14_gender_variant TEXT,
  reverse_scored BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_item_number ON item(item_number);
CREATE INDEX idx_item_section ON item(section);
