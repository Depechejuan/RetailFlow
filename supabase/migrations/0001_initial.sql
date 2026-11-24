create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'supervisor', 'employee');
create type public.product_status as enum ('active', 'archived');
create type public.movement_type as enum ('receipt', 'shipment', 'transfer', 'adjustment');
create type public.incident_status as enum ('open', 'in_progress', 'resolved');
create type public.incident_priority as enum ('low', 'medium', 'high', 'critical');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'employee',
  active boolean not null default true,
  primary key (organization_id, user_id)
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  city text not null default '',
  manager text not null default '',
  active boolean not null default true,
  unique (organization_id, code)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  color text not null default '#b6e36b',
  unique (organization_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid references public.categories(id) on delete restrict,
  sku text not null,
  name text not null,
  description text not null default '',
  cost_price numeric(12,2) not null check (cost_price >= 0),
  sale_price numeric(12,2) not null check (sale_price >= 0),
  default_min_stock integer not null default 0 check (default_min_stock >= 0),
  status public.product_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (organization_id, sku)
);

create table public.store_inventory (
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 0 check (quantity >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  updated_at timestamptz not null default now(),
  primary key (store_id, product_id)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  type public.movement_type not null,
  quantity integer not null check (quantity > 0),
  adjustment_delta integer,
  source_store_id uuid references public.stores(id),
  destination_store_id uuid references public.stores(id),
  actor_user_id uuid not null references public.profiles(id),
  idempotency_key text not null,
  note text not null default '',
  occurred_at timestamptz not null default now(),
  unique (organization_id, idempotency_key),
  check (source_store_id is null or destination_store_id is null or source_store_id <> destination_store_id)
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  store_id uuid references public.stores(id) on delete restrict,
  type text not null,
  description text not null,
  status public.incident_status not null default 'open',
  priority public.incident_priority not null default 'medium',
  owner_user_id uuid references public.profiles(id),
  reported_by_user_id uuid not null references public.profiles(id),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index inventory_movements_org_date_idx on public.inventory_movements (organization_id, occurred_at desc);
create index incidents_org_status_idx on public.incidents (organization_id, status);
create index store_inventory_product_idx on public.store_inventory (product_id);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members where organization_id = target_org and user_id = auth.uid() and active);
$$;

create or replace function public.has_store_access(target_store uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.stores s
    join public.organization_members m on m.organization_id = s.organization_id
    where s.id = target_store and m.user_id = auth.uid() and m.active
  );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.incidents enable row level security;
alter table public.audit_logs enable row level security;

create policy "members see their organizations" on public.organizations for select to authenticated using (public.is_org_member(id));
create policy "users see their profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "members see membership" on public.organization_members for select to authenticated using (user_id = auth.uid() or public.is_org_member(organization_id));
create policy "members see stores" on public.stores for select to authenticated using (public.is_org_member(organization_id));
create policy "members see categories" on public.categories for select to authenticated using (public.is_org_member(organization_id));
create policy "members see products" on public.products for select to authenticated using (public.is_org_member(organization_id));
create policy "members see inventory" on public.store_inventory for select to authenticated using (public.has_store_access(store_id));
create policy "members see movements" on public.inventory_movements for select to authenticated using (public.is_org_member(organization_id));
create policy "members see incidents" on public.incidents for select to authenticated using (public.is_org_member(organization_id));
create policy "members see audit" on public.audit_logs for select to authenticated using (public.is_org_member(organization_id));

-- Mutations must go through server-side authorization and the transactional RPC.
-- No direct INSERT/UPDATE/DELETE policy is intentionally exposed here.
