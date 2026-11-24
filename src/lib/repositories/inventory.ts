import { createSupabaseServerClient } from "@/lib/supabase/server";
import { inventory as demoInventory } from "@/lib/demo-data";
import { stockHealth } from "@/lib/inventory";
import { hasSupabaseConfig } from "@/lib/data-source";
import type { InventoryItem } from "@/lib/types";

type InventoryRow = { quantity: number; minimum_stock: number; updated_at: string; product: { id: string; sku: string; name: string; category_id: string; cost_price: number; sale_price: number; default_min_stock: number; status: "active" | "archived" } | null; store: { id: string } | null };

export async function loadInventory(): Promise<InventoryItem[]> {
  if (!hasSupabaseConfig()) return demoInventory;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("store_inventory").select("quantity, minimum_stock, updated_at, product:products(id, sku, name, category_id, cost_price, sale_price, default_min_stock, status), store:stores(id)");
  if (error) throw new Error(`No se pudo cargar el inventario: ${error.message}`);
  return ((data ?? []) as unknown as InventoryRow[]).flatMap((row) => row.product && row.store ? [{
    id: row.product.id,
    sku: row.product.sku,
    name: row.product.name,
    categoryId: row.product.category_id,
    costPrice: Number(row.product.cost_price),
    salePrice: Number(row.product.sale_price),
    minStock: row.minimum_stock ?? row.product.default_min_stock,
    status: row.product.status,
    stock: row.quantity,
    storeId: row.store.id,
    lastMovement: row.updated_at,
    health: stockHealth(row.quantity, row.minimum_stock ?? row.product.default_min_stock),
  }] : []);
}
