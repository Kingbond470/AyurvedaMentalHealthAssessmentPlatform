-- Create ItemResponse table

CREATE TABLE item_response (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL REFERENCES session(id) ON DELETE CASCADE,

  item_number INT NOT NULL,
  probe1_score INT NOT NULL,
  probe2_score INT NOT NULL,
  probe3_score INT NOT NULL,
  item_total INT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  UNIQUE(session_id, item_number)
);

CREATE INDEX idx_item_response_session_id ON item_response(session_id);
