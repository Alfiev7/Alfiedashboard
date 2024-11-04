export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          user_id: string
          meeting_goal: number
          mmr_goal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meeting_goal: number
          mmr_goal: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meeting_goal?: number
          mmr_goal?: number
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          contact_name: string
          company_name: string
          meeting_date: string
          outcome: 'Scheduled' | 'No show' | 'Completed' | 'Rescheduled' | 'Unqualified'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_name: string
          company_name: string
          meeting_date: string
          outcome: 'Scheduled' | 'No show' | 'Completed' | 'Rescheduled' | 'Unqualified'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_name?: string
          company_name?: string
          meeting_date?: string
          outcome?: 'Scheduled' | 'No show' | 'Completed' | 'Rescheduled' | 'Unqualified'
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          user_id: string
          name: string
          value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          value?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}