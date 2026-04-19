-- Run once on the target DB (synchronize is disabled).
-- Adds new columns introduced by the habit/task refactor.

DO $$ BEGIN
  CREATE TYPE habits_kind_enum AS ENUM ('habit', 'task');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE habits_frequency_type_enum AS ENUM ('daily', 'weekly', 'custom');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS kind           habits_kind_enum           NOT NULL DEFAULT 'habit',
  ADD COLUMN IF NOT EXISTS frequency_type habits_frequency_type_enum NOT NULL DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS times_per_week integer,
  ADD COLUMN IF NOT EXISTS start_date     date,
  ADD COLUMN IF NOT EXISTS end_date       date,
  ADD COLUMN IF NOT EXISTS notes          text;

-- Migrate legacy schedule_days → frequency_type = 'custom' when a list is present.
UPDATE habits
SET frequency_type = 'custom'
WHERE frequency_type = 'daily'
  AND schedule_days IS NOT NULL
  AND schedule_days::text NOT IN ('[]', 'null');
