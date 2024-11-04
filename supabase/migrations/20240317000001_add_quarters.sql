-- Drop existing quarters table if it exists
DROP TABLE IF EXISTS public.quarters CASCADE;

-- Create quarters table with the correct structure
CREATE TABLE IF NOT EXISTS public.quarters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add quarter_id to existing tables
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id);

ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id);

ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES public.quarters(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS quarters_user_id_idx ON public.quarters(user_id);
CREATE INDEX IF NOT EXISTS quarters_is_active_idx ON public.quarters(is_active);
CREATE INDEX IF NOT EXISTS goals_quarter_id_idx ON public.goals(quarter_id);
CREATE INDEX IF NOT EXISTS meetings_quarter_id_idx ON public.meetings(quarter_id);
CREATE INDEX IF NOT EXISTS deals_quarter_id_idx ON public.deals(quarter_id);

-- Set up RLS for quarters
ALTER TABLE public.quarters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own quarters"
    ON public.quarters
    FOR ALL
    USING (auth.uid() = user_id);