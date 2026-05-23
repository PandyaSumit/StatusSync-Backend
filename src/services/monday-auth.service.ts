import { exchangeCodeForToken } from '../lib/monday/oauth.js'
import { mondayGraphQL } from '../lib/monday/graphql.js'
import { tokenRepository } from '../repositories/token.repository.js'

const ME_QUERY = `
  query {
    me {
      account { id }
    }
  }
`

export const mondayAuthService = {
  async handleOAuthCallback(code: string): Promise<{ accountId: number }> {
    const tokenResponse = await exchangeCodeForToken(code)
    const me = await mondayGraphQL<{ me: { account: { id: string } } }>(
      ME_QUERY,
      undefined,
      tokenResponse.access_token,
    )
    const accountId = Number(me.me.account.id)
    await tokenRepository.save(
      accountId,
      tokenResponse.access_token,
      tokenResponse.scope,
    )
    return { accountId }
  },

  async getAccessTokenForAccount(accountId: number): Promise<string | null> {
    const stored = await tokenRepository.getByAccountId(accountId)
    return stored?.accessToken ?? null
  },
}
