import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Meeting, Deal, Goals } from '../types';

export function useGoals(quarterId?: string) {
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (quarterId) {
      fetchGoals();
    } else {
      setGoals(null);
      setLoading(false);
    }
  }, [quarterId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('quarter_id', quarterId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGoals({
          meetingGoal: data.meeting_goal,
          mmrGoal: data.mmr_goal
        });
      } else {
        setGoals(null);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const updateGoals = async (newGoals: Goals) => {
    if (!quarterId) return null;

    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          quarter_id: quarterId,
          meeting_goal: newGoals.meetingGoal,
          mmr_goal: newGoals.mmrGoal,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setGoals({
        meetingGoal: data.meeting_goal,
        mmrGoal: data.mmr_goal
      });

      return data;
    } catch (err) {
      console.error('Error updating goals:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  };

  return { goals, loading, error, updateGoals };
}

export function useMeetings(quarterId?: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (quarterId) {
      fetchMeetings();
    } else {
      setMeetings([]);
      setLoading(false);
    }
  }, [quarterId]);

  const fetchMeetings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .eq('quarter_id', quarterId)
        .order('meeting_date', { ascending: false });

      if (error) throw error;

      setMeetings(data?.map(meeting => ({
        id: meeting.id,
        contactName: meeting.contact_name,
        companyName: meeting.company_name,
        meetingDate: meeting.meeting_date,
        outcome: meeting.outcome
      })) || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    if (!quarterId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          quarter_id: quarterId,
          contact_name: meeting.contactName,
          company_name: meeting.companyName,
          meeting_date: meeting.meetingDate,
          outcome: meeting.outcome
        })
        .select()
        .single();

      if (error) throw error;

      const newMeeting: Meeting = {
        id: data.id,
        contactName: data.contact_name,
        companyName: data.company_name,
        meetingDate: data.meeting_date,
        outcome: data.outcome
      };

      setMeetings(prev => [newMeeting, ...prev]);
      return newMeeting;
    } catch (err) {
      console.error('Error adding meeting:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    if (!quarterId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('meetings')
        .update({
          contact_name: updates.contactName,
          company_name: updates.companyName,
          meeting_date: updates.meetingDate,
          outcome: updates.outcome,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('quarter_id', quarterId)
        .select()
        .single();

      if (error) throw error;

      const updatedMeeting: Meeting = {
        id: data.id,
        contactName: data.contact_name,
        companyName: data.company_name,
        meetingDate: data.meeting_date,
        outcome: data.outcome
      };

      setMeetings(prev => prev.map(meeting => 
        meeting.id === id ? updatedMeeting : meeting
      ));

      return updatedMeeting;
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  };

  const deleteMeeting = async (id: string) => {
    if (!quarterId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('quarter_id', quarterId);

      if (error) throw error;

      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    }
  };

  return { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting };
}

export function useDeals(quarterId?: string) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (quarterId) {
      fetchDeals();
    } else {
      setDeals([]);
      setLoading(false);
    }
  }, [quarterId]);

  const fetchDeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id)
        .eq('quarter_id', quarterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDeals(data?.map(deal => ({
        id: deal.id,
        name: deal.name,
        value: deal.value
      })) || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addDeal = async (deal: Omit<Deal, 'id'>) => {
    if (!quarterId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('deals')
        .insert({
          user_id: user.id,
          quarter_id: quarterId,
          name: deal.name,
          value: deal.value
        })
        .select()
        .single();

      if (error) throw error;

      const newDeal: Deal = {
        id: data.id,
        name: data.name,
        value: data.value
      };

      setDeals(prev => [newDeal, ...prev]);
      return newDeal;
    } catch (err) {
      console.error('Error adding deal:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  };

  const deleteDeal = async (id: string) => {
    if (!quarterId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('quarter_id', quarterId);

      if (error) throw error;

      setDeals(prev => prev.filter(deal => deal.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    }
  };

  return { deals, loading, error, addDeal, deleteDeal };
}