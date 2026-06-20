-- Create a dedicated table for latest odometer readings
CREATE TABLE IF NOT EXISTS public.latest_odometer_readings (
  id integer PRIMARY KEY,
  odometer numeric NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Seed a single row if not present
INSERT INTO public.latest_odometer_readings (id, odometer, updated_at)
VALUES (1, 19988, now())
ON CONFLICT (id) DO NOTHING;
