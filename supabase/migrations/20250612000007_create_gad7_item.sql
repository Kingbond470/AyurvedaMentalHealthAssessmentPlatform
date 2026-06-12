-- Create GAD7Item table

CREATE TABLE gad7_item (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  item_number INT NOT NULL UNIQUE,

  question_en TEXT NOT NULL,
  question_hi TEXT,
  question_mr TEXT,

  option0_en TEXT NOT NULL,
  option0_hi TEXT,
  option0_mr TEXT,
  option0_score INT NOT NULL DEFAULT 0,

  option1_en TEXT NOT NULL,
  option1_hi TEXT,
  option1_mr TEXT,
  option1_score INT NOT NULL DEFAULT 1,

  option2_en TEXT NOT NULL,
  option2_hi TEXT,
  option2_mr TEXT,
  option2_score INT NOT NULL DEFAULT 2,

  option3_en TEXT NOT NULL,
  option3_hi TEXT,
  option3_mr TEXT,
  option3_score INT NOT NULL DEFAULT 3,

  is_impairment_item BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
