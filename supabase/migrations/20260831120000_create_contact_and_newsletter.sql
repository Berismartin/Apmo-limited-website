-- Contact form submissions and newsletter signups.
--
-- Both are written server-side via the Supabase service-role client (see
-- src/lib/actions/contact.ts), which bypasses RLS entirely — the policies
-- below only matter if these tables are ever queried with the anon/user key
-- (e.g. a future admin screen using the browser client), and intentionally
-- allow no public access since these are one-way inboxes, not user data.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Contact messages are admin readable" on public.contact_messages;
create policy "Contact messages are admin readable"
on public.contact_messages for select
using (public.is_admin());

drop policy if exists "Contact messages are admin writable" on public.contact_messages;
create policy "Contact messages are admin writable"
on public.contact_messages for all
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Newsletter subscribers are admin readable" on public.newsletter_subscribers;
create policy "Newsletter subscribers are admin readable"
on public.newsletter_subscribers for select
using (public.is_admin());

drop policy if exists "Newsletter subscribers are admin writable" on public.newsletter_subscribers;
create policy "Newsletter subscribers are admin writable"
on public.newsletter_subscribers for all
using (public.is_admin())
with check (public.is_admin());
