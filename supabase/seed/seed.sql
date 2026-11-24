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
       '00000000-0000-0000-0001-00000000000' || (((n - 1) % 5) + 1),
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
