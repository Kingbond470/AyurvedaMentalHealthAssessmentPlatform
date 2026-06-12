-- Create SubtypeConfig table

CREATE TABLE subtype_config (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  subtype_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_items INT NOT NULL,
  max_score INT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
