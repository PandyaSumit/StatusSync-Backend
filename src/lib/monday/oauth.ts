import axios from 'axios'
import { mondayConfig } from '../../config/env.js'
import type { MondayOAuthTokenResponse } from '../../types/monday.js'
import { AppError } from '../errors.js'

export function buildMondayAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: mondayConfig.clientId,
    redirect_uri: mondayConfig.redirectUri,
    scope: mondayConfig.scopes.join(' '),
    state,
    force_install_if_needed: 'true',
  })

  if (mondayConfig.appVersionId) {
    params.set('app_version_id', mondayConfig.appVersionId)
  }

  return `${mondayConfig.authorizeUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(
  code: string,
): Promise<MondayOAuthTokenResponse> {
  if (!mondayConfig.isOAuthConfigured) {
    throw new AppError('monday OAuth is not configured', 503, 'OAUTH_NOT_CONFIGURED')
  }

  const body = new URLSearchParams({
    client_id: mondayConfig.clientId,
    client_secret: mondayConfig.clientSecret,
    redirect_uri: mondayConfig.redirectUri,
    code,
  })

  const { data } = await axios.post<MondayOAuthTokenResponse>(
    mondayConfig.tokenUrl,
    body.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  )

  return data
}
