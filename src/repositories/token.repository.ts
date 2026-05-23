import { getSupabaseAdmin } from '../lib/supabase/admin.js'
import { mapAccountRow } from '../lib/supabase/mappers.js'
import type { StoredAccountToken } from '../types/monday.js'

export const tokenRepository = {
  async save(accountId: number, accessToken: string, scope: string): Promise<void> {
    const supabase = getSupabaseAdmin()
    const { data: existing } = await supabase
      .from('monday_accounts')
      .select('installed_at')
      .eq('account_id', accountId)
      .maybeSingle()

    const now = new Date().toISOString()
    const { error } = await supabase.from('monday_accounts').upsert(
      {
        account_id: accountId,
        access_token: accessToken,
        scope,
        installed_at: existing?.installed_at ?? now,
        updated_at: now,
      },
      { onConflict: 'account_id' },
    )

    if (error) throw error
  },

  async getByAccountId(accountId: number): Promise<StoredAccountToken | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('monday_accounts')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    if (error) throw error
    return data ? mapAccountRow(data) : null
  },

  async delete(accountId: number): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('monday_accounts')
      .delete()
      .eq('account_id', accountId)

    if (error) throw error
  },
}
