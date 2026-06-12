-- Create Respondent table

CREATE TABLE respondent (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  respondent_code TEXT NOT NULL UNIQUE,
  age INT NOT NULL,
  gender gender NOT NULL,
  education TEXT,
  occupation TEXT,
  name TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  language language NOT NULL DEFAULT 'EN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_respondent_code ON respondent(respondent_code);
