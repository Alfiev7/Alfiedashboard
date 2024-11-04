-- Drop existing tables and recreate with proper constraints
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    quarter_id UUID NOT NULL REFERENCES public.quarters(id) ON DELETE CASCADE,
    meeting_goal INTEGER NOT NULL CHECK (meeting_goal > 0),
    mmr_goal INTEGER NOT NULL CHECK (mmr_goal > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, quarter_id)
);

-- Create meetings table
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    quarter_id UUID NOT NULL REFERENCES public.quarters(id) ON DELETE CASCADE,
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
    quarter_id UUID NOT NULL REFERENCES public.quarters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value INTEGER NOT NULL CHECK (value > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX quarters_user_id_idx ON public.quarters(user_id);
CREATE INDEX quarters_is_active_idx ON public.quarters(is_active);
CREATE INDEX goals_user_id_quarter_idx ON public.goals(user_id, quarter_id);
CREATE INDEX meetings_user_id_quarter_idx ON public.meetings(user_id, quarter_id);
CREATE INDEX deals_user_id_quarter_idx ON public.deals(user_id, quarter_id);

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