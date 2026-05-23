import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`StatusSync API listening on http://localhost:${env.PORT}`)
  console.log(`Health: http://localhost:${env.PORT}/api/health`)
  console.log(`monday OAuth: ${env.APP_URL}/api/auth/monday`)
})
