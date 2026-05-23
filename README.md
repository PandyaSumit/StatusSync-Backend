# StatusSync Backend

Node.js API for **StatusSync** — monday.com marketplace app for scheduled board digest emails.

## Stack

- **Express** + **TypeScript**
- **monday.com OAuth** — long-lived `access_token` per account (stored in `data/`, swap for PostgreSQL)
- **Session JWT** — board view frontend sends `sessionToken`; verified with `MONDAY_CLIENT_SECRET`
- **GraphQL** — `https://api.monday.com/v2` for board data
- Ready for **PostgreSQL**, **Redis/BullMQ**, **Resend**

## Project structure

```
src/
├── config/env.ts           # Validated env vars
├── lib/monday/
│   ├── oauth.ts            # Authorize + token exchange
│   ├── session.ts          # Verify sessionToken JWT
│   └── graphql.ts          # monday API client
├── middleware/
│   ├── monday-session.middleware.ts
│   └── error.middleware.ts
├── repositories/           # File store (MVP) → replace with DB
├── routes/
│   ├── auth.routes.ts
│   ├── digests.routes.ts
│   ├── health.routes.ts
│   └── webhooks.routes.ts
├── services/
└── types/
```

## Setup

### 1. Install & env

```bash
npm install
cp .env.example .env
```

### 2. monday.com Developer Center

1. [Create an app](https://developer.monday.com/apps/docs/create-an-app)
2. **OAuth & Permissions** — add scopes (match `.env`):
   - `boards:read`, `boards:write`, `account:read`, `users:read`
3. Set **Redirect URL** to:
   ```
   http://localhost:3000/api/auth/monday/callback
   ```
4. Copy **Client ID**, **Client Secret**, **Signing Secret** into `.env`
5. **Build → Features** — add **Board View**, point to frontend URL (tunnel in dev)

### 3. API token (optional, local dev only)

For scripts without OAuth, set `MONDAY_API_TOKEN` from Avatar → Developers → API token. **Never** expose in frontend.

### 4. Run

```bash
npm run dev
```

- Health: `GET http://localhost:3000/api/health`
- OAuth install: `GET http://localhost:3000/api/auth/monday`
- Auth status: `GET http://localhost:3000/api/auth/status`

## API (authenticated routes)

Send monday **session token** from the board view:

```
Authorization: Bearer <sessionToken>
```

Or header: `X-Monday-Session-Token: <sessionToken>`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/digests` | List digests for account |
| GET | `/api/digests/:id` | Get one digest |
| POST | `/api/digests` | Create digest |
| PATCH | `/api/digests/:id` | Update digest |
| DELETE | `/api/digests/:id` | Delete digest |

## monday.com auth model

| Token | Where | Use |
|-------|--------|-----|
| **OAuth access_token** | Backend `data/account-tokens.json` | Scheduled jobs, server GraphQL |
| **sessionToken** (JWT) | Frontend → backend header | Verify user + `accountId` per request |
| **shortLivedToken** | Inside integration JWT | 5 min API calls (integrations) |
| **Signing secret** | Webhook `Authorization` JWT | Verify lifecycle webhooks |

Frontend must **never** receive `MONDAY_CLIENT_SECRET` or OAuth tokens.

## CORS

Allows `FRONTEND_URL` and `*.monday.com` origins.

## Next steps

- [ ] PostgreSQL + Prisma for tokens & digests
- [ ] BullMQ workers for scheduled sends
- [ ] Resend HTML templates
- [ ] Board/group/column config on digest model
