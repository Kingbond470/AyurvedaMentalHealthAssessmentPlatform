-- Add visibility flag to Item table
-- isVisible = false means item is hidden from respondents during assessment
-- Admin can toggle per item; hidden items are excluded from scoring max_score calculation

ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- Index for fast filtering of visible items during assessment
CREATE INDEX IF NOT EXISTS "Item_isVisible_idx" ON "Item" ("isVisible") WHERE "isVisible" = true;
