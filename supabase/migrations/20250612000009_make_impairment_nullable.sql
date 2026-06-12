-- Make impairment_score nullable in gad7_response table

ALTER TABLE gad7_response
ALTER COLUMN impairment_score DROP NOT NULL;
