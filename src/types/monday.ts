/** Payload inside sessionToken JWT (verified with MONDAY_CLIENT_SECRET). */
export type MondaySessionPayload = {
  accountId: number
  userId: number
  aud?: string
  exp?: number
  iat?: number
  shortLivedToken?: string
}

export type MondayOAuthTokenResponse = {
  access_token: string
  token_type: string
  scope: string
}

export type StoredAccountToken = {
  accountId: number
  accessToken: string
  scope: string
  installedAt: string
  updatedAt: string
}
