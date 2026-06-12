-- Create SessionResult table

CREATE TABLE session_result (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL UNIQUE REFERENCES session(id) ON DELETE CASCADE,

  -- MPPI Results
  subtype_raw_scores JSONB,
  subtype_max_scores JSONB,
  subtype_percentages JSONB NOT NULL,

  predominant_prakriti TEXT NOT NULL,
  secondary_prakriti TEXT NOT NULL,
  primary_category TEXT NOT NULL,

  -- GAD-7 Results
  gad7_total INT NOT NULL,
  gad7_severity TEXT NOT NULL,
  gad7_impairment TEXT NOT NULL,

  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_result_session_id ON session_result(session_id);
