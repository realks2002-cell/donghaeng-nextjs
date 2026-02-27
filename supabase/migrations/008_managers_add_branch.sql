-- Add branch column to managers table
ALTER TABLE managers ADD COLUMN IF NOT EXISTS branch text NULL;
