import jwt from 'jsonwebtoken'
import { mondayConfig } from '../../config/env.js'
import type { MondaySessionPayload } from '../../types/monday.js'
import { UnauthorizedError } from '../errors.js'

export function verifyMondaySessionToken(token: string): MondaySessionPayload {
  if (!mondayConfig.clientSecret) {
    throw new UnauthorizedError(
      'MONDAY_CLIENT_SECRET is not configured — cannot verify session tokens',
    )
  }

  try {
    const payload = jwt.verify(token, mondayConfig.clientSecret) as MondaySessionPayload
    if (!payload.accountId || !payload.userId) {
      throw new UnauthorizedError('Invalid session token payload')
    }
    return payload
  } catch {
    throw new UnauthorizedError('Invalid or expired monday session token')
  }
}
