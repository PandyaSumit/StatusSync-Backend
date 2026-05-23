import { getSupabaseAdmin } from '../lib/supabase/admin.js'
import { tokenRepository } from '../repositories/token.repository.js'

export const accountService = {
  /** Ensures a monday_accounts row exists (required for digest FK). */
  async ensureAccountExists(accountId: number): Promise<void> {
    const existing = await tokenRepository.getByAccountId(accountId)
    if (existing) return

    const { error } = await getSupabaseAdmin().from('monday_accounts').upsert(
      {
        account_id: accountId,
        access_token: null,
        scope: '',
      },
      { onConflict: 'account_id' },
    )

    if (error) throw error
  },

  async hasOAuthToken(accountId: number): Promise<boolean> {
    const stored = await tokenRepository.getByAccountId(accountId)
    return Boolean(stored?.accessToken && stored.accessToken.length > 0)
  },
}
