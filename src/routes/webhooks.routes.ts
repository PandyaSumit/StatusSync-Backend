import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { mondayConfig } from '../config/env.js'
import { tokenRepository } from '../repositories/token.repository.js'

export const webhooksRoutes = Router()

/**
 * monday app lifecycle webhooks (install / uninstall).
 * Configure URL in Developer Center when ready.
 * Verify JWT with MONDAY_SIGNING_SECRET (or CLIENT_SECRET for lifecycle).
 */
webhooksRoutes.post('/webhooks/monday', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization' })
    return
  }

  const token = authHeader.slice(7)
  const secret = mondayConfig.signingSecret

  if (!secret) {
    res.status(503).json({ error: 'Signing secret not configured' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as {
      accountId?: number
      type?: string
    }

    const event = req.body as { type?: string; data?: { account_id?: number } }
    const accountId = payload.accountId ?? event.data?.account_id

    if (event.type === 'uninstall' && accountId) {
      await tokenRepository.delete(Number(accountId))
    }

    res.status(200).json({ ok: true })
  } catch {
    res.status(401).json({ error: 'Invalid webhook signature' })
  }
})
