-- Drop and recreate goals table with proper constraints
DROP TABLE IF EXISTS public.goals CASCADE;

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

-- Create index for better performance
CREATE INDEX goals_user_quarter_idx ON public.goals(user_id, quarter_id);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can only access their own goals"
    ON public.goals
    FOR ALL
    USING (auth.uid() = user_id);