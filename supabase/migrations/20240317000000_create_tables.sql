-- Create tables for the BDR dashboard
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    meeting_goal INTEGER NOT NULL,
    mmr_goal INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    contact_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    meeting_date DATE NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('Scheduled', 'No show', 'Completed', 'Rescheduled', 'Unqualified')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS meetings_user_id_idx ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS deals_user_id_idx ON public.deals(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own goals"
    ON public.goals
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own meetings"
    ON public.meetings
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own deals"
    ON public.deals
    FOR ALL
    USING (auth.uid() = user_id);