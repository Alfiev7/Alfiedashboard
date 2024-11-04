import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = 'https://dqjspvloyswkzmuixblz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxanNwdmxveXN3a3ptdWl4Ymx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNjMyNDksImV4cCI6MjA0NTkzOTI0OX0.FABDL7fNbixW1b8FZ0eRrYv67Uxa6HB9bgTjqlLTuZI'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Database helper functions
export async function fetchUserGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserGoals(userId: string, goals: { meeting_goal: number; mmr_goal: number }) {
  const { data, error } = await supabase
    .from('goals')
    .upsert({
      user_id: userId,
      ...goals,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function fetchUserMeetings(userId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('meeting_date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function updateMeeting(userId: string, meetingId: string, updates: Partial<Database['public']['Tables']['meetings']['Update']>) {
  const { data, error } = await supabase
    .from('meetings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', meetingId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createMeeting(userId: string, meeting: Omit<Database['public']['Tables']['meetings']['Insert'], 'id' | 'user_id'>) {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      user_id: userId,
      ...meeting,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function fetchUserDeals(userId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createDeal(userId: string, deal: Omit<Database['public']['Tables']['deals']['Insert'], 'id' | 'user_id'>) {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      user_id: userId,
      ...deal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateDeal(userId: string, dealId: string, updates: Partial<Database['public']['Tables']['deals']['Update']>) {
  const { data, error } = await supabase
    .from('deals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', dealId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}