import { createSupabaseServerClient } from "@/lib/supabase/server";
import { incidents as demoIncidents } from "@/lib/demo-data";
import { hasSupabaseConfig } from "@/lib/data-source";
import type { Incident } from "@/lib/types";

export async function loadIncidents(): Promise<Incident[]> {
  if (!hasSupabaseConfig()) return demoIncidents;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("incidents").select("id, type, description, status, priority, created_at, product:products(name), store:stores(name), owner:profiles!owner_user_id(full_name)").order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar las incidencias: ${error.message}`);
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), type: String(row.type), description: String(row.description), productName: String((row.product as { name?: string } | null)?.name ?? "Sin producto"), storeName: String((row.store as { name?: string } | null)?.name ?? "Sin tienda"), status: row.status as Incident["status"], priority: row.priority as Incident["priority"], owner: String((row.owner as { full_name?: string } | null)?.full_name ?? "Sin asignar"), createdAt: String(row.created_at),
  }));
}
