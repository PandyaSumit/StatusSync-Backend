import { Router } from 'express'
import { mondayConfig } from '../config/env.js'

export const healthRoutes = Router()

healthRoutes.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'statussync-api',
    mondayOAuthConfigured: mondayConfig.isOAuthConfigured,
  })
})
