-- StatusSync initial schema (applied to project StatusSync)

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.monday_accounts (
  account_id bigint primary key,
  access_token text not null,
  scope text not null default '',
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger monday_accounts_updated_at
  before update on public.monday_accounts
  for each row execute function public.set_updated_at();

create type public.digest_frequency as enum (
  'daily', 'weekly', 'biweekly', 'monthly', 'once'
);

create table public.digests (
  id uuid primary key default gen_random_uuid(),
  account_id bigint not null references public.monday_accounts (account_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  board_ids text[] not null default '{}',
  is_active boolean not null default true,
  frequency public.digest_frequency not null default 'weekly',
  recipient_count integer not null default 0 check (recipient_count >= 0),
  next_send_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index digests_account_id_idx on public.digests (account_id);

create trigger digests_updated_at
  before update on public.digests
  for each row execute function public.set_updated_at();

create table public.digest_recipients (
  id uuid primary key default gen_random_uuid(),
  digest_id uuid not null references public.digests (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  unique (digest_id, email)
);

create index digest_recipients_digest_id_idx on public.digest_recipients (digest_id);

alter table public.monday_accounts enable row level security;
alter table public.digests enable row level security;
alter table public.digest_recipients enable row level security;

revoke all on public.monday_accounts from anon, authenticated;
revoke all on public.digests from anon, authenticated;
revoke all on public.digest_recipients from anon, authenticated;
