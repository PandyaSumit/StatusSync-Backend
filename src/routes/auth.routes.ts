import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import { env, getOAuthConfigurationIssues, mondayConfig } from '../config/env.js'
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

    // Private app testing: show success page (no marketplace / separate frontend needed)
    res.send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>StatusSync authorized</title>
<style>body{font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#fafafa;margin:0}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px 28px;max-width:420px;text-align:center}
h1{font-size:18px;margin:0 0 8px}p{color:#6b7280;font-size:14px;margin:0 0 16px;line-height:1.5}</style></head>
<body><div class="card"><h1>StatusSync authorized</h1>
<p>OAuth is complete for account ${accountId}. Close this tab and refresh StatusSync in monday.com.</p>
<script>setTimeout(()=>window.close(),4000)</script></div></body></html>`)
  } catch (error) {
    next(error)
  }
})

authRoutes.get('/auth/status', (_req, res) => {
  const issues = getOAuthConfigurationIssues()
  const appUrl = env.APP_URL.replace(/\/$/, '')
  res.json({
    oauthConfigured: mondayConfig.isOAuthConfigured,
    redirectUri: mondayConfig.redirectUri,
    authorizeUrl: `${appUrl}/api/auth/monday`,
    scopes: mondayConfig.scopes,
    appVersionId: mondayConfig.appVersionId ?? null,
    appId: mondayConfig.appId,
    appUrl: env.APP_URL,
    configurationOk: issues.length === 0,
    issues,
  privateTesting: {
      marketplaceRequired: false,
      steps: [
        'Developer Center → OAuth & Permissions → add redirect URL + scopes',
        'Developer Center → App versions → Promote your version to live',
        'Developer Center → Distribute → Install app (on your account)',
        'Open Authorize link to complete OAuth',
      ],
      developerCenterUrl: `https://developer.monday.com/apps/${mondayConfig.appId}`,
      installPath: 'Developer Center → Distribute → Install app',
      promotePath: 'Developer Center → App versions → Promote to live',
    },
    developerCenter: {
      redirectUrlsPath: 'Developer Center → StatusSync → OAuth & Permissions → Redirect URLs',
      requiredRedirectUri: mondayConfig.redirectUri,
      requiredScopes: mondayConfig.scopes,
    },
  })
})
