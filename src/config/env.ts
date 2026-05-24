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
  MONDAY_OAUTH_SCOPES: z
    .string()
    .default('boards:read,boards:write,account:read,users:read'),
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
    return (
      env.MONDAY_REDIRECT_URI ??
      `${env.APP_URL}/api/auth/monday/callback`
    )
  },
  get appVersionId() {
    return env.MONDAY_APP_VERSION_ID
  },
  scopes: env.MONDAY_OAUTH_SCOPES.split(',').map((s) => s.trim()).filter(Boolean),
  authorizeUrl: 'https://auth.monday.com/oauth2/authorize',
  tokenUrl: 'https://auth.monday.com/oauth2/token',
  apiUrl: 'https://api.monday.com/v2',
}
