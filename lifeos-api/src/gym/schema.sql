-- Run once on the target DB (synchronize is disabled)
DO $$ BEGIN
  CREATE TYPE gym_activities_activity_type_enum AS ENUM ('walk', 'weights', 'cardio', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS gym_activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type   gym_activities_activity_type_enum NOT NULL,
  duration        integer NOT NULL,
  weight          double precision,
  notes           varchar,
  date            date NOT NULL,
  created_at      timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gym_activities_user_date_idx ON gym_activities(user_id, date DESC);
