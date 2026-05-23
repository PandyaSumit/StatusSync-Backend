import type { Digest } from '../../types/digest.js'
import type { Database } from '../../types/database.types.js'
import type { StoredAccountToken } from '../../types/monday.js'

type DigestRow = Database['public']['Tables']['digests']['Row']
type AccountRow = Database['public']['Tables']['monday_accounts']['Row']

export function mapDigestRow(row: DigestRow | Record<string, unknown>): Digest {
  const r = row as DigestRow
  return {
    id: r.id,
    accountId: r.account_id,
    name: r.name,
    boardIds: r.board_ids,
    isActive: r.is_active,
    frequency: r.frequency,
    recipientCount: r.recipient_count,
    nextSendAt: r.next_send_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapAccountRow(row: AccountRow | Record<string, unknown>): StoredAccountToken {
  const r = row as AccountRow
  return {
    accountId: r.account_id,
    accessToken: r.access_token ?? '',
    scope: r.scope,
    installedAt: r.installed_at,
    updatedAt: r.updated_at,
  }
}
