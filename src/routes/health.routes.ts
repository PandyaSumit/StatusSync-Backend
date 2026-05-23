import { Router } from 'express'
import { checkSupabaseConnection } from '../lib/supabase/admin.js'
import { mondayConfig, supabaseConfig } from '../config/env.js'

export const healthRoutes = Router()

healthRoutes.get('/health', async (_req, res) => {
  const supabaseConnected = supabaseConfig.isConfigured
    ? await checkSupabaseConnection()
    : false

  res.json({
    status: 'ok',
    service: 'statussync-api',
    mondayOAuthConfigured: mondayConfig.isOAuthConfigured,
    supabaseConfigured: supabaseConfig.isConfigured,
    supabaseConnected,
  })
})
