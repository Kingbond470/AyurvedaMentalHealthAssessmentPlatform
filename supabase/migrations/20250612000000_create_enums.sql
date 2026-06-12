-- Create enum types for schema

CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE language AS ENUM ('EN', 'HI', 'MR');
CREATE TYPE session_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');
CREATE TYPE assessment_phase AS ENUM ('MPPI', 'GAD7', 'RESULTS');
CREATE TYPE gad7_severity AS ENUM ('MINIMAL', 'MILD', 'MODERATE', 'SEVERE');
