/** Normalized session context after verifying monday sessionToken JWT. */
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
