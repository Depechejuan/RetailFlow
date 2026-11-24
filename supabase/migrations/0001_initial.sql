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

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

create table public.member_stores (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  primary key (user_id, store_id)
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
    left join public.member_stores ms on ms.organization_id = s.organization_id and ms.user_id = m.user_id and ms.store_id = s.id
    where s.id = target_store and m.user_id = auth.uid() and m.active and (m.role = 'admin' or ms.store_id is not null)
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members where organization_id = target_org and user_id = auth.uid() and active and role = 'admin');
$$;

create or replace function public.can_access_movement(target_org uuid, source_store uuid, destination_store uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_admin(target_org)
    or (source_store is not null and public.has_store_access(source_store))
    or (destination_store is not null and public.has_store_access(destination_store));
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.member_stores enable row level security;
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
create policy "members see store assignments" on public.member_stores for select to authenticated using (user_id = auth.uid() or public.is_org_admin(organization_id));
create policy "members see stores" on public.stores for select to authenticated using (public.is_org_member(organization_id));
create policy "members see categories" on public.categories for select to authenticated using (public.is_org_member(organization_id));
create policy "members see products" on public.products for select to authenticated using (public.is_org_member(organization_id));
create policy "members see inventory" on public.store_inventory for select to authenticated using (public.has_store_access(store_id));
create policy "members see movements" on public.inventory_movements for select to authenticated using (public.can_access_movement(organization_id, source_store_id, destination_store_id));
create policy "members see incidents" on public.incidents for select to authenticated using (public.is_org_admin(organization_id) or (store_id is not null and public.has_store_access(store_id)));
create policy "members see audit" on public.audit_logs for select to authenticated using (public.is_org_member(organization_id));

create or replace function public.apply_inventory_movement(
  p_organization_id uuid,
  p_product_id uuid,
  p_type public.movement_type,
  p_quantity integer,
  p_source_store_id uuid default null,
  p_destination_store_id uuid default null,
  p_adjustment_delta integer default null,
  p_idempotency_key text default '',
  p_note text default ''
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  actor uuid := auth.uid();
  movement_id uuid;
  source_quantity integer;
  destination_quantity integer;
  effective_delta integer;
begin
  if actor is null or not public.is_org_member(p_organization_id) then raise exception 'No autorizado para esta organización'; end if;
  if p_quantity <= 0 or p_idempotency_key = '' then raise exception 'Cantidad o idempotencia inválida'; end if;
  select id into movement_id from public.inventory_movements where organization_id = p_organization_id and idempotency_key = p_idempotency_key;
  if movement_id is not null then return movement_id; end if;
  if not exists (select 1 from public.products where id = p_product_id and organization_id = p_organization_id) then raise exception 'Producto inválido'; end if;
  if p_source_store_id is not null and not exists (select 1 from public.stores where id = p_source_store_id and organization_id = p_organization_id) then raise exception 'Tienda de origen inválida'; end if;
  if p_destination_store_id is not null and not exists (select 1 from public.stores where id = p_destination_store_id and organization_id = p_organization_id) then raise exception 'Tienda de destino inválida'; end if;
  if p_type = 'receipt' and p_destination_store_id is null then raise exception 'La entrada necesita destino'; end if;
  if p_type = 'shipment' and p_source_store_id is null then raise exception 'La salida necesita origen'; end if;
  if p_type = 'transfer' and (p_source_store_id is null or p_destination_store_id is null or p_source_store_id = p_destination_store_id) then raise exception 'El traspaso necesita origen y destino distintos'; end if;
  if p_type = 'adjustment' and (p_source_store_id is null or p_adjustment_delta is null or p_adjustment_delta = 0) then raise exception 'El ajuste necesita tienda y diferencia'; end if;
  if p_source_store_id is not null and not public.has_store_access(p_source_store_id) then raise exception 'Sin acceso a la tienda de origen'; end if;
  if p_destination_store_id is not null and not public.has_store_access(p_destination_store_id) then raise exception 'Sin acceso a la tienda de destino'; end if;

  if p_source_store_id is not null then
    insert into public.store_inventory (store_id, product_id, quantity) values (p_source_store_id, p_product_id, 0) on conflict do nothing;
    select quantity into source_quantity from public.store_inventory where store_id = p_source_store_id and product_id = p_product_id for update;
  end if;
  if p_destination_store_id is not null then
    insert into public.store_inventory (store_id, product_id, quantity) values (p_destination_store_id, p_product_id, 0) on conflict do nothing;
    select quantity into destination_quantity from public.store_inventory where store_id = p_destination_store_id and product_id = p_product_id for update;
  end if;

  if p_type in ('shipment', 'transfer') and source_quantity < p_quantity then raise exception 'Stock insuficiente'; end if;
  effective_delta := case when p_type = 'adjustment' then p_adjustment_delta else p_quantity end;
  if p_type = 'adjustment' and source_quantity + effective_delta < 0 then raise exception 'El ajuste produciría stock negativo'; end if;
  if p_source_store_id is not null and p_type in ('shipment', 'transfer', 'adjustment') then update public.store_inventory set quantity = quantity - case when p_type = 'adjustment' then -effective_delta else p_quantity end, updated_at = now() where store_id = p_source_store_id and product_id = p_product_id; end if;
  if p_destination_store_id is not null and p_type in ('receipt', 'transfer') then update public.store_inventory set quantity = quantity + p_quantity, updated_at = now() where store_id = p_destination_store_id and product_id = p_product_id; end if;
  insert into public.inventory_movements (organization_id, product_id, type, quantity, adjustment_delta, source_store_id, destination_store_id, actor_user_id, idempotency_key, note) values (p_organization_id, p_product_id, p_type, case when p_type = 'adjustment' then abs(p_adjustment_delta) else p_quantity end, p_adjustment_delta, p_source_store_id, p_destination_store_id, actor, p_idempotency_key, p_note) returning id into movement_id;
  insert into public.audit_logs (organization_id, actor_user_id, action, entity_type, entity_id, metadata) values (p_organization_id, actor, 'inventory.movement', 'inventory_movement', movement_id, jsonb_build_object('type', p_type, 'quantity', p_quantity));
  return movement_id;
end;
$$;
