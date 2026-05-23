import type { NextFunction, Request, Response } from 'express'
import { verifyMondaySessionToken } from '../lib/monday/session.js'
import type { MondaySessionPayload } from '../types/monday.js'
import { UnauthorizedError } from '../lib/errors.js'

export type MondayAuthenticatedRequest = Request & {
  monday: MondaySessionPayload
}

export function mondaySessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization
  const token =
    header?.startsWith('Bearer ') ? header.slice(7) : req.headers['x-monday-session-token']

  if (!token || typeof token !== 'string') {
    res.status(401).json({
      error: 'Missing monday session token',
      code: 'MISSING_SESSION_TOKEN',
    })
    return
  }

  try {
    const payload = verifyMondaySessionToken(token)
    ;(req as MondayAuthenticatedRequest).monday = payload
    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: error.message, code: error.code })
      return
    }
    next(error)
  }
}
