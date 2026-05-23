import { getSupabaseAdmin } from '../lib/supabase/admin.js'
import { mapDigestRow } from '../lib/supabase/mappers.js'
import { NotFoundError } from '../lib/errors.js'
import type {
  CreateDigestInput,
  Digest,
  UpdateDigestInput,
} from '../types/digest.js'

export const digestRepository = {
  async listByAccount(accountId: number): Promise<Digest[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('digests')
      .select('*')
      .eq('account_id', accountId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map(mapDigestRow)
  },

  async getById(accountId: number, id: string): Promise<Digest> {
    const { data, error } = await getSupabaseAdmin()
      .from('digests')
      .select('*')
      .eq('id', id)
      .eq('account_id', accountId)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new NotFoundError('Digest not found')
    return mapDigestRow(data)
  },

  async create(accountId: number, input: CreateDigestInput): Promise<Digest> {
    const { data, error } = await getSupabaseAdmin()
      .from('digests')
      .insert({
        account_id: accountId,
        name: input.name,
        board_ids: input.boardIds,
        is_active: input.isActive ?? true,
        frequency: input.frequency,
      })
      .select('*')
      .single()

    if (error) throw error
    return mapDigestRow(data)
  },

  async update(
    accountId: number,
    id: string,
    input: UpdateDigestInput,
  ): Promise<Digest> {
    const payload: Record<string, unknown> = {}
    if (input.name !== undefined) payload.name = input.name
    if (input.boardIds !== undefined) payload.board_ids = input.boardIds
    if (input.isActive !== undefined) payload.is_active = input.isActive
    if (input.frequency !== undefined) payload.frequency = input.frequency

    const { data, error } = await getSupabaseAdmin()
      .from('digests')
      .update(payload)
      .eq('id', id)
      .eq('account_id', accountId)
      .select('*')
      .maybeSingle()

    if (error) throw error
    if (!data) throw new NotFoundError('Digest not found')
    return mapDigestRow(data)
  },

  async delete(accountId: number, id: string): Promise<void> {
    const { data, error } = await getSupabaseAdmin()
      .from('digests')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId)
      .select('id')

    if (error) throw error
    if (!data?.length) throw new NotFoundError('Digest not found')
  },
}
