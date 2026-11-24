import { categories, products as demoProducts, stores as demoStores } from "@/lib/demo-data";
import { hasSupabaseConfig } from "@/lib/data-source";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, Store } from "@/lib/types";

export async function loadCatalog(): Promise<{ products: Product[]; stores: Store[]; categories: typeof categories }> {
  if (!hasSupabaseConfig()) return { products: demoProducts, stores: demoStores, categories };
  const supabase = await createSupabaseServerClient();
  const [{ data: productsData, error: productsError }, { data: storesData, error: storesError }] = await Promise.all([
    supabase.from("products").select("id, sku, name, category_id, cost_price, sale_price, default_min_stock, status").eq("status", "active").order("name"),
    supabase.from("stores").select("id, code, name, city, manager").eq("active", true).order("name"),
  ]);
  if (productsError || storesError) throw new Error(productsError?.message ?? storesError?.message ?? "No se pudo cargar el catálogo.");
  return {
    products: ((productsData ?? []) as Array<Record<string, unknown>>).map((product) => ({ id: String(product.id), sku: String(product.sku), name: String(product.name), categoryId: String(product.category_id), costPrice: Number(product.cost_price), salePrice: Number(product.sale_price), minStock: Number(product.default_min_stock), status: product.status as Product["status"] })),
    stores: ((storesData ?? []) as Array<Record<string, unknown>>).map((store) => ({ id: String(store.id), code: String(store.code), name: String(store.name), city: String(store.city), manager: String(store.manager) })),
    categories,
  };
}
