import jwt, { type JwtPayload } from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { mondayConfig } from '../../config/env.js'
import type { MondaySessionPayload } from '../../types/monday.js'
import { UnauthorizedError } from '../errors.js'

/** Raw JWT body from monday board-view sessionToken (see monday.get docs). */
type MondaySessionTokenData = {
  account_id?: number
  user_id?: number
  client_id?: string
  app_id?: number
  app_version_id?: number
}

type MondaySessionJwtPayload = JwtPayload & {
  dat?: MondaySessionTokenData
  accountId?: number
  userId?: number
  account_id?: number
  user_id?: number
}

function getVerificationSecrets(): string[] {
  const secrets = new Set<string>()
  if (mondayConfig.clientSecret) secrets.add(mondayConfig.clientSecret)
  if (mondayConfig.signingSecret && mondayConfig.signingSecret !== mondayConfig.clientSecret) {
    secrets.add(mondayConfig.signingSecret)
  }
  return [...secrets]
}

function verifyTokenSignature(token: string): MondaySessionJwtPayload {
  const secrets = getVerificationSecrets()
  if (secrets.length === 0) {
    throw new UnauthorizedError(
      'MONDAY_CLIENT_SECRET is not configured — cannot verify session tokens',
    )
  }

  let lastError: unknown
  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret, { algorithms: ['HS256'] }) as MondaySessionJwtPayload
    } catch (error) {
      lastError = error
    }
  }

  if (env.NODE_ENV !== 'production' && lastError instanceof Error) {
    console.error('[monday session] JWT verify failed:', lastError.message)
  }

  throw new UnauthorizedError('Invalid or expired monday session token')
}

function normalizePayload(payload: MondaySessionJwtPayload): MondaySessionPayload {
  const dat = payload.dat
  const accountId = dat?.account_id ?? payload.accountId ?? payload.account_id
  const userId = dat?.user_id ?? payload.userId ?? payload.user_id

  if (accountId == null || userId == null) {
    throw new UnauthorizedError('Invalid session token payload')
  }

  return {
    accountId: Number(accountId),
    userId: Number(userId),
    aud: typeof payload.aud === 'string' ? payload.aud : undefined,
    exp: payload.exp,
    iat: payload.iat,
    shortLivedToken:
      typeof payload.shortLivedToken === 'string' ? payload.shortLivedToken : undefined,
  }
}

export function verifyMondaySessionToken(token: string): MondaySessionPayload {
  const payload = verifyTokenSignature(token)
  return normalizePayload(payload)
}
