import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { healthRoutes } from './routes/health.routes.js'
import { authRoutes } from './routes/auth.routes.js'
import { digestsRoutes } from './routes/digests.routes.js'
import { webhooksRoutes } from './routes/webhooks.routes.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: [env.FRONTEND_URL, /\.monday\.com$/],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Monday-Session-Token'],
    }),
  )
  app.use(express.json())

  app.use('/api', healthRoutes)
  app.use('/api', authRoutes)
  app.use('/api', digestsRoutes)
  app.use('/api', webhooksRoutes)

  app.use(errorMiddleware)

  return app
}
