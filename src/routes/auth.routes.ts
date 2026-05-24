import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import { env, mondayConfig } from '../config/env.js'
import { buildMondayAuthorizeUrl } from '../lib/monday/oauth.js'
import { mondayAuthService } from '../services/monday-auth.service.js'
import { AppError } from '../lib/errors.js'

const oauthStates = new Map<string, number>()

export const authRoutes = Router()

authRoutes.get('/auth/monday', (_req, res) => {
  if (!mondayConfig.isOAuthConfigured) {
    res.status(503).json({
      error: 'Configure MONDAY_CLIENT_ID and MONDAY_CLIENT_SECRET',
      code: 'OAUTH_NOT_CONFIGURED',
    })
    return
  }

  const state = randomBytes(16).toString('hex')
  oauthStates.set(state, Date.now())
  res.redirect(buildMondayAuthorizeUrl(state))
})

authRoutes.get('/auth/monday/callback', async (req, res, next) => {
  try {
    const code = req.query.code
    const state = req.query.state

    if (typeof code !== 'string') {
      throw new AppError('Missing authorization code', 400, 'MISSING_CODE')
    }

    if (typeof state === 'string' && !oauthStates.has(state)) {
      throw new AppError('Invalid OAuth state', 400, 'INVALID_STATE')
    }
    if (typeof state === 'string') oauthStates.delete(state)

    const { accountId } = await mondayAuthService.handleOAuthCallback(code)
    const redirect = new URL(env.FRONTEND_URL)
    redirect.searchParams.set('monday_auth', 'success')
    redirect.searchParams.set('account_id', String(accountId))
    res.redirect(redirect.toString())
  } catch (error) {
    next(error)
  }
})

authRoutes.get('/auth/status', (_req, res) => {
  res.json({
    oauthConfigured: mondayConfig.isOAuthConfigured,
    redirectUri: mondayConfig.redirectUri,
    authorizeUrl: `${env.APP_URL}/api/auth/monday`,
    scopes: mondayConfig.scopes,
    appVersionId: mondayConfig.appVersionId ?? null,
  })
})
