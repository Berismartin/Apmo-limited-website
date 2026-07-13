-- Create testimonials table
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null default '',
  rating integer not null default 5 check (rating between 1 and 5),
  featured boolean not null default false,
  sort_order integer not null default 0,
  avatar_url text,
  avatar_alt text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_sort_order_idx
  on public.testimonials (sort_order asc, created_at desc);

-- Trigger for updated_at
drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.testimonials enable row level security;

-- Policies
drop policy if exists "Published testimonials are publicly readable" on public.testimonials;
create policy "Published testimonials are publicly readable"
on public.testimonials for select
using (published = true or public.is_admin());

drop policy if exists "Testimonials are admin writable" on public.testimonials;
create policy "Testimonials are admin writable"
on public.testimonials for all
using (public.is_admin())
with check (public.is_admin());

-- Seed from current site content
insert into public.testimonials (id, quote, name, role, rating, featured, sort_order, published)
values
  (
    '00000000-0000-4000-8000-000000000401',
    'The products feel luxurious without being complicated. My wash day finally feels calm.',
    'Martha A.',
    'Natural hair customer',
    5,
    true,
    1,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    'Apmo understands textured hair from experience, not trend. The guidance is as good as the formulas.',
    'Sarah K.',
    'Beauty retailer',
    5,
    true,
    2,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000403',
    'The detangler changed our morning routine. It works fast and leaves a beautiful finish.',
    'Grace N.',
    'Parent and client',
    5,
    true,
    3,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000404',
    'The consultation helped me understand why my hair felt dry by day three. The routine finally makes sense.',
    'Judith N.',
    'Consultation client',
    5,
    false,
    4,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000405',
    'I love that Apmo gives instructions that feel practical. The products fit real life, not just perfect salon days.',
    'Patricia L.',
    'Protective style wearer',
    5,
    false,
    5,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000406',
    'The mist has enough slip for my daughter''s hair and does not leave a heavy film. Wash day is calmer now.',
    'Amina T.',
    'Parent and customer',
    5,
    false,
    6,
    true
  )
on conflict (id) do update set
  quote = excluded.quote,
  name = excluded.name,
  role = excluded.role,
  rating = excluded.rating,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  published = excluded.published;
