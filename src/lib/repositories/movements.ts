import { createSupabaseServerClient } from "@/lib/supabase/server";
import { movements as demoMovements } from "@/lib/demo-data";
import { hasSupabaseConfig } from "@/lib/data-source";
import type { Movement } from "@/lib/types";

export async function loadMovements(): Promise<Movement[]> {
  if (!hasSupabaseConfig()) return demoMovements;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("inventory_movements").select("id, type, product_id, quantity, occurred_at, note, product:products(name), source:stores!source_store_id(name), destination:stores!destination_store_id(name), actor:profiles!actor_user_id(full_name)").order("occurred_at", { ascending: false }).limit(100);
  if (error) throw new Error(`No se pudieron cargar los movimientos: ${error.message}`);
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), type: row.type as Movement["type"], productId: String(row.product_id), productName: String((row.product as { name?: string } | null)?.name ?? "Producto"), quantity: Number(row.quantity), occurredAt: String(row.occurred_at), actor: String((row.actor as { full_name?: string } | null)?.full_name ?? "Usuario"), note: String(row.note ?? ""), sourceStore: (row.source as { name?: string } | null)?.name, destinationStore: (row.destination as { name?: string } | null)?.name,
  }));
}
