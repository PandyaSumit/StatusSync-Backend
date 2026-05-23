export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      digest_recipients: {
        Row: {
          created_at: string
          digest_id: string
          display_name: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          digest_id: string
          display_name?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          digest_id?: string
          display_name?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      digests: {
        Row: {
          account_id: number
          board_ids: string[]
          created_at: string
          frequency: Database['public']['Enums']['digest_frequency']
          id: string
          is_active: boolean
          name: string
          next_send_at: string | null
          recipient_count: number
          updated_at: string
        }
        Insert: {
          account_id: number
          board_ids?: string[]
          created_at?: string
          frequency?: Database['public']['Enums']['digest_frequency']
          id?: string
          is_active?: boolean
          name: string
          next_send_at?: string | null
          recipient_count?: number
          updated_at?: string
        }
        Update: {
          account_id?: number
          board_ids?: string[]
          created_at?: string
          frequency?: Database['public']['Enums']['digest_frequency']
          id?: string
          is_active?: boolean
          name?: string
          next_send_at?: string | null
          recipient_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      monday_accounts: {
        Row: {
          access_token: string
          account_id: number
          installed_at: string
          scope: string
          updated_at: string
        }
        Insert: {
          access_token: string
          account_id: number
          installed_at?: string
          scope?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          account_id?: number
          installed_at?: string
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Enums: {
      digest_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'once'
    }
  }
}
