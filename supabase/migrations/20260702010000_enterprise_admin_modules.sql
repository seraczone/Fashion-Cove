create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_user_roles (
  user_id uuid not null references public.admin_users(user_id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  logo_url text,
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text not null default '',
  city text,
  country text not null default 'Nigeria',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  sku text not null,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  reorder_point integer not null default 0 check (reorder_point >= 0),
  status text not null default 'in_stock' check (status in ('in_stock', 'low_stock', 'out_of_stock')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  address text not null default '',
  status text not null default 'active' check (status in ('active', 'blocked')),
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  customer_name text not null,
  reason text not null default '',
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'received', 'closed')),
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  return_id uuid references public.returns(id) on delete set null,
  amount integer not null default 0 check (amount >= 0),
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider text not null default 'manual',
  reference text,
  amount integer not null default 0 check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  carrier text,
  base_fee integer not null default 0 check (base_fee >= 0),
  estimated_days text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null default 0 check (discount_value >= 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'expired')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null default 0 check (discount_value >= 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'expired')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  recipient_email text,
  initial_balance integer not null default 0 check (initial_balance >= 0),
  current_balance integer not null default 0 check (current_balance >= 0),
  status text not null default 'active' check (status in ('active', 'redeemed', 'disabled')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  asset_type text not null default 'image' check (asset_type in ('image', 'video', 'document')),
  alt_text text not null default '',
  folder text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  placement text not null,
  image_url text,
  target_url text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  section_type text not null default 'content',
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'email',
  budget integer not null default 0 check (budget >= 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  channel text not null default 'admin',
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs(actor_id, action, resource, resource_id, metadata)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    case when tg_op = 'DELETE' then old.id::text else new.id::text end,
    jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles', 'brands', 'collections', 'warehouses', 'suppliers',
    'inventory_items', 'customers', 'returns', 'refunds', 'payments',
    'shipping_methods', 'reviews', 'coupons', 'discounts', 'gift_cards',
    'cms_pages', 'media_assets', 'advertisements', 'homepage_sections',
    'marketing_campaigns', 'notifications'
  ]
  loop
    execute format('drop trigger if exists %1$s_set_updated_at on public.%1$I', table_name);
    execute format(
      'create trigger %1$s_set_updated_at before update on public.%1$I for each row execute function public.set_updated_at()',
      table_name
    );

    execute format('drop trigger if exists %1$s_audit_log on public.%1$I', table_name);
    execute format(
      'create trigger %1$s_audit_log after insert or update or delete on public.%1$I for each row execute function public.write_audit_log()',
      table_name
    );
  end loop;
end;
$$;

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.admin_user_roles enable row level security;
alter table public.brands enable row level security;
alter table public.collections enable row level security;
alter table public.warehouses enable row level security;
alter table public.suppliers enable row level security;
alter table public.inventory_items enable row level security;
alter table public.customers enable row level security;
alter table public.returns enable row level security;
alter table public.refunds enable row level security;
alter table public.payments enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.discounts enable row level security;
alter table public.gift_cards enable row level security;
alter table public.cms_pages enable row level security;
alter table public.media_assets enable row level security;
alter table public.advertisements enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.notifications enable row level security;
alter table public.store_settings enable row level security;
alter table public.audit_logs enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'roles', 'permissions', 'admin_user_roles', 'brands', 'collections',
    'warehouses', 'suppliers', 'inventory_items', 'customers', 'returns',
    'refunds', 'payments', 'shipping_methods', 'reviews', 'coupons',
    'discounts', 'gift_cards', 'cms_pages', 'media_assets', 'advertisements',
    'homepage_sections', 'marketing_campaigns', 'notifications',
    'store_settings', 'audit_logs'
  ]
  loop
    execute format('drop policy if exists "Admins can manage %1$s" on public.%1$I', table_name);
    execute format(
      'create policy "Admins can manage %1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name
    );
  end loop;
end;
$$;

create index if not exists inventory_items_product_id_idx on public.inventory_items(product_id);
create index if not exists inventory_items_warehouse_id_idx on public.inventory_items(warehouse_id);
create index if not exists returns_order_id_idx on public.returns(order_id);
create index if not exists refunds_order_id_idx on public.refunds(order_id);
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists audit_logs_resource_idx on public.audit_logs(resource);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at);
