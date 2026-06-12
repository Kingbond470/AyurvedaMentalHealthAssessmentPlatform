-- Create GAD7Response table

CREATE TABLE gad7_response (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL UNIQUE REFERENCES session(id) ON DELETE CASCADE,

  item1_score INT NOT NULL,
  item2_score INT NOT NULL,
  item3_score INT NOT NULL,
  item4_score INT NOT NULL,
  item5_score INT NOT NULL,
  item6_score INT NOT NULL,
  item7_score INT NOT NULL,
  impairment_score INT NOT NULL,

  total_score INT NOT NULL,
  severity gad7_severity NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_gad7_response_session_id ON gad7_response(session_id);
