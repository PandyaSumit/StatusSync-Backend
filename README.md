# StatusSync Backend

Node.js API for **StatusSync** — monday.com marketplace app with **Supabase (PostgreSQL)**.

## Stack

- Express + TypeScript
- **Supabase** — Postgres (`monday_accounts`, `digests`, `digest_recipients`)
- monday.com OAuth + session JWT
- Deployed on Render

## Database (Supabase)

**Project:** StatusSync (`fxjkxjgwidgrxyurdveb`)  
**URL:** `https://fxjkxjgwidgrxyurdveb.supabase.co`

Schema is in `supabase/migrations/`. Applied via Supabase dashboard or CLI.

| Table | Purpose |
|-------|---------|
| `monday_accounts` | OAuth tokens per monday account |
| `digests` | Scheduled digest configs |
| `digest_recipients` | Emails per digest (ready for wizard) |

RLS is **enabled** with **no public policies** — only the backend `service_role` key can read/write.

## Environment variables

```env
# Server
APP_URL=https://statussync-backend.onrender.com
FRONTEND_URL=https://monday.com

# monday OAuth
MONDAY_CLIENT_ID=
MONDAY_CLIENT_SECRET=
MONDAY_SIGNING_SECRET=
MONDAY_REDIRECT_URI=https://statussync-backend.onrender.com/api/auth/monday/callback

# Supabase — Project Settings → API
SUPABASE_URL=https://fxjkxjgwidgrxyurdveb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=   # secret — never expose to frontend
```

Optional: `DATABASE_URL` for `psql` / migrations (Database → Connection string).

## Setup

```bash
cp .env.example .env
# Fill MONDAY_* and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Health: `GET /api/health` → includes `supabaseConnected: true`

## Scripts

- `npm run dev` — local API
- `npm run build` / `npm start` — production

## Supabase CLI (optional)

```bash
npx supabase link --project-ref fxjkxjgwidgrxyurdveb
npx supabase db push
```

## API

All `/api/digests` routes require `Authorization: Bearer <monday sessionToken>`.

See previous README sections for OAuth install and monday Developer Center setup.
