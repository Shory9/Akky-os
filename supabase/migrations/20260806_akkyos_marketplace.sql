begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text,
  description text,
  category text,
  logo_url text,
  screenshots jsonb not null default '[]'::jsonb check (jsonb_typeof(screenshots) = 'array'),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  price_inr numeric(12,2) check (price_inr is null or price_inr >= 0),
  price_label text not null default 'Price on request',
  product_status text not null default 'draft' check (product_status in ('draft', 'active', 'archived')),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  business_name text,
  email text,
  phone text,
  message text,
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  next_follow_up_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  amount_inr numeric(12,2) not null check (amount_inr >= 0),
  order_status text not null default 'pending' check (order_status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_provider text,
  payment_reference text unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_licenses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  customer_brand_name text,
  customer_logo_url text,
  custom_domain text,
  license_status text not null default 'provisioning' check (license_status in ('provisioning', 'active', 'suspended', 'cancelled')),
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_public_idx on public.products(product_status, is_featured, sort_order);
create index if not exists leads_status_idx on public.leads(status, created_at desc);
create index if not exists leads_product_idx on public.leads(product_id, created_at desc);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(order_status, created_at desc);
create index if not exists licenses_user_idx on public.product_licenses(user_id, license_status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''))
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
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists licenses_set_updated_at on public.product_licenses;
create trigger licenses_set_updated_at before update on public.product_licenses
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.orders enable row level security;
alter table public.product_licenses enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated
using (product_status = 'active' or public.is_admin());

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products for insert to authenticated
with check (public.is_admin());

drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products for delete to authenticated
using (public.is_admin());

drop policy if exists leads_public_create on public.leads;
create policy leads_public_create on public.leads for insert to anon, authenticated
with check (user_id is null or user_id = auth.uid());

drop policy if exists leads_admin_read on public.leads;
create policy leads_admin_read on public.leads for select to authenticated
using (public.is_admin());

drop policy if exists leads_admin_update on public.leads;
create policy leads_admin_update on public.leads for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists leads_admin_delete on public.leads;
create policy leads_admin_delete on public.leads for delete to authenticated
using (public.is_admin());

drop policy if exists orders_customer_read on public.orders;
create policy orders_customer_read on public.orders for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists licenses_customer_read on public.product_licenses;
create policy licenses_customer_read on public.product_licenses for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists licenses_customer_brand_update on public.product_licenses;
create policy licenses_customer_brand_update on public.product_licenses for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.leads from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.product_licenses from anon, authenticated;

grant select on table public.products to anon, authenticated;
grant insert on table public.leads to anon, authenticated;
grant select, update, delete on table public.leads to authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on table public.profiles to authenticated;
grant insert, update, delete on table public.products to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.product_licenses to authenticated;
grant update (customer_brand_name, customer_logo_url, custom_domain) on table public.product_licenses to authenticated;

commit;
