import { mondayConfig } from '../../config/env.js'

/** OAuth tokens require Bearer prefix; personal API tokens do not. */
export function formatMondayAuthHeader(accessToken: string): string {
  if (accessToken.startsWith('Bearer ')) return accessToken
  // OAuth app tokens from our install flow are long JWT-like strings
  if (accessToken.includes('.') && accessToken.split('.').length === 3) {
    return `Bearer ${accessToken}`
  }
  return accessToken
}

export { mondayConfig }
