-- Apmo catalog backend
-- Apply with: supabase db push

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  image_alt text,
  image_width integer,
  image_height integer,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null default '',
  body text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  tags text[] not null default '{}',
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  name text not null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  currency text not null default 'USD',
  inventory_quantity integer not null default 0,
  track_inventory boolean not null default true,
  allow_backorder boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  weight numeric,
  dimensions jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_products_created_at on public.products(created_at);
create index if not exists idx_product_categories_category_id on public.product_categories(category_id);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

drop policy if exists "Profiles are self readable" on public.profiles;
create policy "Profiles are self readable"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles are admin writable" on public.profiles;
create policy "Profiles are admin writable"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Brands are publicly readable" on public.brands;
create policy "Brands are publicly readable"
on public.brands for select
using (true);

drop policy if exists "Brands are admin writable" on public.brands;
create policy "Brands are admin writable"
on public.brands for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
on public.categories for select
using (true);

drop policy if exists "Categories are admin writable" on public.categories;
create policy "Categories are admin writable"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active products are publicly readable" on public.products;
create policy "Active products are publicly readable"
on public.products for select
using (status = 'active' or public.is_admin());

drop policy if exists "Products are admin writable" on public.products;
create policy "Products are admin writable"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Product categories are publicly readable" on public.product_categories;
create policy "Product categories are publicly readable"
on public.product_categories for select
using (true);

drop policy if exists "Product categories are admin writable" on public.product_categories;
create policy "Product categories are admin writable"
on public.product_categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Product images are publicly readable" on public.product_images;
create policy "Product images are publicly readable"
on public.product_images for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and (products.status = 'active' or public.is_admin())
  )
);

drop policy if exists "Product images are admin writable" on public.product_images;
create policy "Product images are admin writable"
on public.product_images for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Product variants are publicly readable" on public.product_variants;
create policy "Product variants are publicly readable"
on public.product_variants for select
using (
  exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and (products.status = 'active' or public.is_admin())
  )
);

drop policy if exists "Product variants are admin writable" on public.product_variants;
create policy "Product variants are admin writable"
on public.product_variants for all
using (public.is_admin())
with check (public.is_admin());

insert into public.brands (id, name, slug, description)
values (
  '00000000-0000-4000-8000-000000000001',
  'Apmo',
  'apmo',
  'Premium textured haircare rituals, education, and product-led beauty experiences from Uganda.'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.categories (id, name, slug, description, image_url, image_alt, image_width, image_height, sort_order)
values
  ('00000000-0000-4000-8000-000000000101', 'Haircare', 'haircare', 'Daily care products for textured hair, coils, curls, relaxed hair, and protective styles.', '/images/site_images/IMG_1706.jpg', 'Apmo haircare products', 1024, 683, 1),
  ('00000000-0000-4000-8000-000000000102', 'Scalp Care', 'scalp-care', 'Lightweight oils, refreshers, and massage rituals for calmer, healthier-looking scalps.', '/images/site_images/FRNK-2056.jpg', 'Apmo scalp care spray', 1024, 683, 2),
  ('00000000-0000-4000-8000-000000000103', 'Ritual Kits', 'ritual-kits', 'Curated wash-day and styling bundles for easier routines from start to finish.', '/images/site_images/FRNK-1955.jpg', 'Apmo hair ritual moment', 683, 1024, 3),
  ('00000000-0000-4000-8000-000000000104', 'Styling', 'styling', 'Soft-hold finishing products that support definition, shine, and touchable movement.', '/images/site_images/FRNK-2049.jpg', 'Apmo styling product', 683, 1024, 4),
  ('00000000-0000-4000-8000-000000000105', 'Consultation', 'consultation', 'Personal product guidance and haircare education for your texture, routine, and goals.', '/images/site_images/FRNK-2012.jpg', 'Apmo beauty consultation', 1024, 683, 5)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  image_width = excluded.image_width,
  image_height = excluded.image_height,
  sort_order = excluded.sort_order;

insert into public.products (id, brand_id, name, slug, description, body, status, tags, rating, review_count, featured, created_at)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000001',
    'Petangler Mist',
    'petangler-mist',
    'A slip-rich detangling spray for quick comb-throughs, soft curl separation, and easier school-morning routines.',
    '<h2>Fast slip without heaviness</h2><p>Petangler Mist is designed for textured hair that needs moisture, movement, and easier sectioning. Mist through damp or dry hair before detangling, then style as usual.</p><h3>Best for</h3><ul><li>Coils, curls, relaxed hair, and protective styles</li><li>Children''s wash-day routines</li><li>Refreshing hair between full wash days</li></ul>',
    'active',
    array['detangler', 'curls', 'kids', 'spray'],
    4.9,
    86,
    true,
    '2026-06-01T10:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000001',
    'Growth Milk',
    'growth-milk',
    'A creamy botanical leave-in that keeps strands feeling soft, moisturized, and ready for protective styling.',
    '<h2>Softness you can feel</h2><p>Growth Milk layers hydration into textured hair without leaving a sticky finish. Use after cleansing or before braids, twists, buns, and low-manipulation styling.</p><h3>How to use</h3><p>Apply a small amount section by section. Focus on mid-lengths and ends, then seal with oil when needed.</p>',
    'active',
    array['leave-in', 'moisture', 'growth', 'cream'],
    4.8,
    64,
    true,
    '2026-06-02T10:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000001',
    'Scalp Revival Oil',
    'scalp-revival-oil',
    'A lightweight scalp oil for massage rituals, shine, and comfort under braids, wigs, twists, and natural styles.',
    '<h2>A calm scalp ritual</h2><p>Scalp Revival Oil is made for light massage, shine, and comfort. It works especially well with protective styles where the scalp needs extra care between wash days.</p>',
    'active',
    array['scalp', 'oil', 'massage', 'shine'],
    4.7,
    48,
    true,
    '2026-06-03T10:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000001',
    'Wash Day Ritual Kit',
    'wash-day-ritual-kit',
    'A complete Apmo routine with detangler, leave-in milk, and scalp oil for a softer, calmer wash day.',
    '<h2>Everything in rhythm</h2><p>The Wash Day Ritual Kit brings Apmo''s core products together so customers can detangle, moisturize, seal, and style with fewer decisions.</p>',
    'active',
    array['bundle', 'wash day', 'routine', 'kit'],
    5.0,
    33,
    true,
    '2026-06-04T10:00:00Z'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  body = excluded.body,
  status = excluded.status,
  tags = excluded.tags,
  rating = excluded.rating,
  review_count = excluded.review_count,
  featured = excluded.featured;

insert into public.product_categories (product_id, category_id)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000104'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000103'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000102'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000103')
on conflict do nothing;

insert into public.product_images (product_id, url, alt, width, height, sort_order)
values
  ('00000000-0000-4000-8000-000000000201', '/images/site_images/FRNK-2056.jpg', 'Apmo Petangler Mist', 1024, 683, 0),
  ('00000000-0000-4000-8000-000000000201', '/images/site_images/IMG_1706.jpg', 'Petangler Mist in a haircare lineup', 1024, 683, 1),
  ('00000000-0000-4000-8000-000000000202', '/images/site_images/FRNK-2049.jpg', 'Apmo Growth Milk', 683, 1024, 0),
  ('00000000-0000-4000-8000-000000000202', '/images/site_images/FRNK-1955.jpg', 'Growth Milk used during a hair ritual', 683, 1024, 1),
  ('00000000-0000-4000-8000-000000000203', '/images/site_images/IMG_1706.jpg', 'Apmo Scalp Revival Oil', 1024, 683, 0),
  ('00000000-0000-4000-8000-000000000204', '/images/site_images/FRNK-1955.jpg', 'Apmo Wash Day Ritual Kit', 683, 1024, 0)
on conflict do nothing;

insert into public.product_variants (product_id, sku, name, price, compare_at_price, currency, inventory_quantity, track_inventory, allow_backorder, options, sort_order)
values
  ('00000000-0000-4000-8000-000000000201', 'APM-PET-250', '250ml', 1800, 2200, 'USD', 42, true, false, '[{"name":"Size","value":"250ml"}]'::jsonb, 0),
  ('00000000-0000-4000-8000-000000000202', 'APM-GRO-200', '200ml', 2400, null, 'USD', 36, true, false, '[{"name":"Size","value":"200ml"}]'::jsonb, 0),
  ('00000000-0000-4000-8000-000000000203', 'APM-SCA-100', '100ml', 1600, null, 'USD', 50, true, false, '[{"name":"Size","value":"100ml"}]'::jsonb, 0),
  ('00000000-0000-4000-8000-000000000204', 'APM-KIT-WASH', 'Standard Kit', 5200, 5800, 'USD', 22, true, false, '[{"name":"Kit","value":"Standard"}]'::jsonb, 0)
on conflict (sku) do update set
  name = excluded.name,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  currency = excluded.currency,
  inventory_quantity = excluded.inventory_quantity,
  track_inventory = excluded.track_inventory,
  allow_backorder = excluded.allow_backorder,
  options = excluded.options,
  sort_order = excluded.sort_order;
