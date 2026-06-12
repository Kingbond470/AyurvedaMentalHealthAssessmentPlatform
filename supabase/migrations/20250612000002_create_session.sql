-- Create Session table

CREATE TABLE session (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  respondent_id TEXT NOT NULL REFERENCES respondent(id) ON DELETE CASCADE,
  practitioner_name TEXT NOT NULL,

  status session_status NOT NULL DEFAULT 'IN_PROGRESS',
  phase assessment_phase NOT NULL DEFAULT 'MPPI',

  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  current_section INT NOT NULL DEFAULT 1,
  current_item INT NOT NULL DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_respondent_id ON session(respondent_id);
CREATE INDEX idx_session_status ON session(status);
CREATE INDEX idx_session_phase ON session(phase);
