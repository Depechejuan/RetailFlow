-- Seed reproducible para datos de demostración. No contiene usuarios ni secretos.
-- Debe ejecutarse después de aplicar las migraciones y asociar un usuario demo.

insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'RetailFlow Demo')
on conflict (id) do update set name = excluded.name;

insert into public.categories (id, organization_id, name, color)
values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Audio', '#8b5cf6'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Movilidad', '#22c55e'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Hogar conectado', '#06b6d4'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Accesorios', '#f59e0b'),
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Cuidado personal', '#f43f5e')
on conflict (id) do update set name = excluded.name, color = excluded.color;

insert into public.stores (id, organization_id, code, name, city, manager)
values
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'MAD-01', 'Madrid Centro', 'Madrid', 'Laura Martín'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'VAL-02', 'Valencia Ruzafa', 'Valencia', 'Sergio Gil'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'SEV-03', 'Sevilla Nervión', 'Sevilla', 'Marta León')
on conflict (id) do update set name = excluded.name, manager = excluded.manager;

insert into public.products (organization_id, sku, name, category_id, cost_price, sale_price, default_min_stock)
select '00000000-0000-0000-0000-000000000001',
       'RF-' || lpad(n::text, 3, '0'),
       'Producto Demo ' || lpad(n::text, 2, '0'),
       ('00000000-0000-0000-0001-00000000000' || (((n - 1) % 5) + 1)::text)::uuid,
       18 + ((n - 1) % 8) * 11,
       39 + ((n - 1) % 8) * 19,
       8 + ((n - 1) % 5) * 3
from generate_series(1, 30) as n
on conflict (organization_id, sku) do update set name = excluded.name, cost_price = excluded.cost_price, sale_price = excluded.sale_price;

insert into public.store_inventory (store_id, product_id, quantity, minimum_stock)
select s.id, p.id, 4 + ((row_number() over (order by p.sku) * 13) % 44), p.default_min_stock
from public.stores s cross join public.products p
where s.organization_id = '00000000-0000-0000-0000-000000000001'
  and p.organization_id = s.organization_id
on conflict (store_id, product_id) do update set quantity = excluded.quantity, minimum_stock = excluded.minimum_stock;

-- Al ejecutarlo después de crear al menos un usuario en Supabase Auth, se completa
-- la parte operativa y se asignan las tres tiendas al primer usuario demo.
do $$
declare
  demo_user uuid;
  p1 uuid;
  p2 uuid;
  p3 uuid;
  mad uuid := '00000000-0000-0000-0002-000000000001';
  val uuid := '00000000-0000-0000-0002-000000000002';
  sev uuid := '00000000-0000-0000-0002-000000000003';
begin
  select id into demo_user from public.profiles order by created_at limit 1;
  if demo_user is null then
    raise notice 'No hay perfiles todavía. Tras crear un usuario, vuelve a ejecutar este seed.';
    return;
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values ('00000000-0000-0000-0000-000000000001', demo_user, 'admin')
  on conflict (organization_id, user_id) do update set role = 'admin', active = true;

  insert into public.member_stores (organization_id, user_id, store_id)
  values
    ('00000000-0000-0000-0000-000000000001', demo_user, mad),
    ('00000000-0000-0000-0000-000000000001', demo_user, val),
    ('00000000-0000-0000-0000-000000000001', demo_user, sev)
  on conflict (user_id, store_id) do nothing;

  select id into p1 from public.products where sku = 'RF-001';
  select id into p2 from public.products where sku = 'RF-007';
  select id into p3 from public.products where sku = 'RF-016';

  insert into public.inventory_movements (id, organization_id, product_id, type, quantity, source_store_id, destination_store_id, actor_user_id, idempotency_key, note, occurred_at)
  values
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', p1, 'receipt', 24, null, mad, demo_user, 'seed-receipt-001', 'Recepción proveedor demo', now() - interval '2 days'),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', p2, 'transfer', 18, mad, val, demo_user, 'seed-transfer-002', 'Reposición por demanda', now() - interval '1 day'),
    ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', p3, 'shipment', 4, sev, null, demo_user, 'seed-shipment-003', 'Venta demo', now() - interval '3 hours')
  on conflict (id) do nothing;

  insert into public.incidents (id, organization_id, product_id, store_id, type, description, status, priority, owner_user_id, reported_by_user_id, created_at)
  values
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000001', p2, val, 'Diferencia de inventario', 'Faltan 3 unidades tras el conteo de apertura.', 'open', 'high', demo_user, demo_user, now() - interval '1 day'),
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000001', p3, sev, 'Producto dañado', 'Caja dañada durante la recepción.', 'in_progress', 'medium', demo_user, demo_user, now() - interval '2 days'),
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000001', p1, mad, 'Recepción incompleta', 'El albarán indica más unidades de las recibidas.', 'resolved', 'low', demo_user, demo_user, now() - interval '7 days')
  on conflict (id) do nothing;
end $$;
