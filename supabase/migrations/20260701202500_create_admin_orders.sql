-- Admin-manageable orders for Apmo

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  subtotal integer not null default 0 check (subtotal >= 0),
  tax integer not null default 0 check (tax >= 0),
  shipping integer not null default 0 check (shipping >= 0),
  total integer not null default 0 check (total >= 0),
  currency text not null default 'USD',
  customer_email text not null,
  customer_name text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_line_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null,
  variant_name text not null default '',
  sku text not null default '',
  image jsonb not null default '{}'::jsonb,
  price integer not null default 0 check (price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_customer_email on public.orders(customer_email);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at);
create index if not exists idx_order_line_items_order_id on public.order_line_items(order_id);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_line_items enable row level security;

drop policy if exists "Orders are readable by owner or admin" on public.orders;
create policy "Orders are readable by owner or admin"
on public.orders for select
using (
  public.is_admin()
  or auth.uid() = user_id
  or customer_email = (select email from auth.users where id = auth.uid())
);

drop policy if exists "Orders are admin writable" on public.orders;
create policy "Orders are admin writable"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Order items readable by order owner or admin" on public.order_line_items;
create policy "Order items readable by order owner or admin"
on public.order_line_items for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    where orders.id = order_line_items.order_id
      and (
        orders.user_id = auth.uid()
        or orders.customer_email = (select email from auth.users where id = auth.uid())
      )
  )
);

drop policy if exists "Order items are admin writable" on public.order_line_items;
create policy "Order items are admin writable"
on public.order_line_items for all
using (public.is_admin())
with check (public.is_admin());

insert into public.orders (
  id,
  order_number,
  status,
  payment_status,
  subtotal,
  tax,
  shipping,
  total,
  currency,
  customer_email,
  customer_name,
  shipping_address
)
values (
  '00000000-0000-4000-8000-000000000301',
  'APMO-1001',
  'processing',
  'captured',
  4200,
  0,
  500,
  4700,
  'USD',
  'customer@example.com',
  'Demo Customer',
  '{"id":"addr-demo","type":"shipping","firstName":"Demo","lastName":"Customer","line1":"Kampala Road","city":"Kampala","state":"Central","postalCode":"00000","country":"UG","isDefault":true}'::jsonb
)
on conflict (order_number) do nothing;

insert into public.order_line_items (
  order_id,
  product_id,
  variant_id,
  name,
  variant_name,
  sku,
  image,
  price,
  quantity,
  total
)
values (
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000201',
  (select id from public.product_variants where sku = 'APM-PET-250'),
  'Petangler Mist',
  '250ml',
  'APM-PET-250',
  '{"url":"/images/site_images/FRNK-2056.jpg","alt":"Apmo Petangler Mist"}'::jsonb,
  1800,
  1,
  1800
),
(
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000202',
  (select id from public.product_variants where sku = 'APM-GRO-200'),
  'Growth Milk',
  '200ml',
  'APM-GRO-200',
  '{"url":"/images/site_images/FRNK-2049.jpg","alt":"Apmo Growth Milk"}'::jsonb,
  2400,
  1,
  2400
)
on conflict do nothing;
