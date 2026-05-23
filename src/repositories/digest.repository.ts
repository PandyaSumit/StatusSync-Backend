import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  CreateDigestInput,
  Digest,
  UpdateDigestInput,
} from '../types/digest.js'
import { NotFoundError } from '../lib/errors.js'

const DATA_DIR = path.join(process.cwd(), 'data')
const DIGESTS_FILE = path.join(DATA_DIR, 'digests.json')

type DigestStore = Digest[]

async function readStore(): Promise<DigestStore> {
  try {
    const raw = await readFile(DIGESTS_FILE, 'utf-8')
    return JSON.parse(raw) as DigestStore
  } catch {
    return []
  }
}

async function writeStore(digests: DigestStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DIGESTS_FILE, JSON.stringify(digests, null, 2), 'utf-8')
}

export const digestRepository = {
  async listByAccount(accountId: number): Promise<Digest[]> {
    const all = await readStore()
    return all.filter((d) => d.accountId === accountId)
  },

  async getById(accountId: number, id: string): Promise<Digest> {
    const digest = (await readStore()).find(
      (d) => d.id === id && d.accountId === accountId,
    )
    if (!digest) throw new NotFoundError('Digest not found')
    return digest
  },

  async create(accountId: number, input: CreateDigestInput): Promise<Digest> {
    const all = await readStore()
    const now = new Date().toISOString()
    const digest: Digest = {
      id: randomUUID(),
      accountId,
      name: input.name,
      boardIds: input.boardIds,
      isActive: input.isActive ?? true,
      frequency: input.frequency,
      recipientCount: 0,
      nextSendAt: null,
      createdAt: now,
      updatedAt: now,
    }
    all.push(digest)
    await writeStore(all)
    return digest
  },

  async update(
    accountId: number,
    id: string,
    input: UpdateDigestInput,
  ): Promise<Digest> {
    const all = await readStore()
    const index = all.findIndex((d) => d.id === id && d.accountId === accountId)
    if (index === -1) throw new NotFoundError('Digest not found')

    const updated: Digest = {
      ...all[index]!,
      ...input,
      updatedAt: new Date().toISOString(),
    }
    all[index] = updated
    await writeStore(all)
    return updated
  },

  async delete(accountId: number, id: string): Promise<void> {
    const all = await readStore()
    const next = all.filter((d) => !(d.id === id && d.accountId === accountId))
    if (next.length === all.length) throw new NotFoundError('Digest not found')
    await writeStore(next)
  },
}
