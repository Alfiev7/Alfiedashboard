-- Drop existing tables to rebuild with correct schema
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.quarters CASCADE;

-- Create quarters table
CREATE TABLE public.quarters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    quarter_id UUID NOT NULL REFERENCES public.quarters(id),
    meeting_goal INTEGER NOT NULL,
    mmr_goal INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    quarter_id UUID NOT NULL REFERENCES public.quarters(id),
    contact_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    meeting_date DATE NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('Scheduled', 'No show', 'Completed', 'Rescheduled', 'Unqualified')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create deals table
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    quarter_id UUID NOT NULL REFERENCES public.quarters(id),
    name TEXT NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX quarters_user_id_idx ON public.quarters(user_id);
CREATE INDEX quarters_is_active_idx ON public.quarters(is_active);
CREATE INDEX goals_user_id_idx ON public.goals(user_id);
CREATE INDEX goals_quarter_id_idx ON public.goals(quarter_id);
CREATE INDEX meetings_user_id_idx ON public.meetings(user_id);
CREATE INDEX meetings_quarter_id_idx ON public.meetings(quarter_id);
CREATE INDEX deals_user_id_idx ON public.deals(user_id);
CREATE INDEX deals_quarter_id_idx ON public.deals(quarter_id);

-- Enable RLS
ALTER TABLE public.quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own quarters"
    ON public.quarters
    FOR ALL
    USING (auth.uid() = user_id);

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