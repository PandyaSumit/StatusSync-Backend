import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { StoredAccountToken } from '../types/monday.js'

const DATA_DIR = path.join(process.cwd(), 'data')
const TOKENS_FILE = path.join(DATA_DIR, 'account-tokens.json')

type TokenStore = Record<string, StoredAccountToken>

async function readStore(): Promise<TokenStore> {
  try {
    const raw = await readFile(TOKENS_FILE, 'utf-8')
    return JSON.parse(raw) as TokenStore
  } catch {
    return {}
  }
}

async function writeStore(store: TokenStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(TOKENS_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export const tokenRepository = {
  async save(accountId: number, accessToken: string, scope: string): Promise<void> {
    const store = await readStore()
    const key = String(accountId)
    const existing = store[key]
    const now = new Date().toISOString()

    store[key] = {
      accountId,
      accessToken,
      scope,
      installedAt: existing?.installedAt ?? now,
      updatedAt: now,
    }

    await writeStore(store)
  },

  async getByAccountId(accountId: number): Promise<StoredAccountToken | null> {
    const store = await readStore()
    return store[String(accountId)] ?? null
  },

  async delete(accountId: number): Promise<void> {
    const store = await readStore()
    delete store[String(accountId)]
    await writeStore(store)
  },
}
