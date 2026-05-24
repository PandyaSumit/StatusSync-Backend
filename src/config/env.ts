import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  MONDAY_CLIENT_ID: z.string().optional(),
  MONDAY_CLIENT_SECRET: z.string().optional(),
  MONDAY_SIGNING_SECRET: z.string().optional(),
  MONDAY_REDIRECT_URI: z.string().url().optional(),
  MONDAY_APP_VERSION_ID: z.string().optional(),
  MONDAY_APP_ID: z.string().optional(),
  MONDAY_OAUTH_SCOPES: z
    .string()
    .default('boards:read,boards:write,account:read,users:read,workspaces:read'),
  MONDAY_API_TOKEN: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  JWT_SECRET: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

function resolveRedirectUri(): string {
  const fromAppUrl = `${env.APP_URL.replace(/\/$/, '')}/api/auth/monday/callback`
  const configured = env.MONDAY_REDIRECT_URI?.replace(/\/$/, '')

  if (!configured) return fromAppUrl

  const isLocalhost =
    configured.includes('localhost') || configured.includes('127.0.0.1')
  const appUrlIsProduction =
    !env.APP_URL.includes('localhost') && !env.APP_URL.includes('127.0.0.1')

  // Render often has APP_URL correct but MONDAY_REDIRECT_URI copied from local .env
  if (env.NODE_ENV === 'production' && isLocalhost && appUrlIsProduction) {
    console.warn(
      `[oauth] MONDAY_REDIRECT_URI is "${configured}" but APP_URL is production — using ${fromAppUrl}`,
    )
    return fromAppUrl
  }

  return configured
}

export function getOAuthConfigurationIssues(): string[] {
  const issues: string[] = []
  const redirectUri = resolveRedirectUri()

  if (!env.MONDAY_CLIENT_ID || !env.MONDAY_CLIENT_SECRET) {
    issues.push('Set MONDAY_CLIENT_ID and MONDAY_CLIENT_SECRET on the backend.')
  }

  if (env.NODE_ENV === 'production') {
    if (redirectUri.includes('localhost') || redirectUri.includes('127.0.0.1')) {
      issues.push(
        'OAuth redirect URI is localhost in production. Set APP_URL and MONDAY_REDIRECT_URI on Render.',
      )
    }
    if (
      env.APP_URL.includes('localhost') ||
      env.APP_URL.includes('127.0.0.1')
    ) {
      issues.push('APP_URL is localhost in production. Set APP_URL on Render.')
    }
  }

  if (env.MONDAY_REDIRECT_URI && env.MONDAY_REDIRECT_URI !== redirectUri) {
    issues.push(
      `MONDAY_REDIRECT_URI env (${env.MONDAY_REDIRECT_URI}) is ignored; using ${redirectUri}. Update Render env vars.`,
    )
  }

  return issues
}

export const supabaseConfig = {
  get isConfigured() {
    return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
  },
}

export const mondayConfig = {
  get isOAuthConfigured() {
    return Boolean(env.MONDAY_CLIENT_ID && env.MONDAY_CLIENT_SECRET)
  },
  get clientId() {
    return env.MONDAY_CLIENT_ID ?? ''
  },
  get clientSecret() {
    return env.MONDAY_CLIENT_SECRET ?? ''
  },
  get signingSecret() {
    return env.MONDAY_SIGNING_SECRET ?? env.MONDAY_CLIENT_SECRET ?? ''
  },
  get redirectUri() {
    return resolveRedirectUri()
  },
  get appVersionId() {
    return env.MONDAY_APP_VERSION_ID
  },
  get appId() {
    return env.MONDAY_APP_ID ?? '11374222'
  },
  scopes: env.MONDAY_OAUTH_SCOPES.split(',').map((s) => s.trim()).filter(Boolean),
  authorizeUrl: 'https://auth.monday.com/oauth2/authorize',
  tokenUrl: 'https://auth.monday.com/oauth2/token',
  apiUrl: 'https://api.monday.com/v2',
}
