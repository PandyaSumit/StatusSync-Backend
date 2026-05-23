import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, supabaseConfig } from '../../config/env.js'
import { AppError } from '../errors.js'

let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseConfig.isConfigured) {
    throw new AppError(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      503,
      'SUPABASE_NOT_CONFIGURED',
    )
  }

  if (!client) {
    client = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return client
}

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseConfig.isConfigured) return false
  const { error } = await getSupabaseAdmin()
    .from('monday_accounts')
    .select('account_id')
    .limit(1)
  return !error
}
