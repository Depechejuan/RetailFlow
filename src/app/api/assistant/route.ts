import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/data-source";
import { getAiMode } from "@/lib/ai/provider";
import { getLowStockProducts, getPendingIncidents, suggestRedistribution } from "@/lib/ai/tools";
import { stores } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({ message: z.string().trim().min(2).max(500) });

async function context() {
  if (!hasSupabaseConfig()) return { organizationId: "demo", allowedStoreIds: stores.map((store) => store.id) };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase.from("organization_members").select("organization_id, role").eq("user_id", user.id).eq("active", true).limit(1).maybeSingle();
  if (!membership) return null;
  if (membership.role === "admin") return { organizationId: membership.organization_id, allowedStoreIds: stores.map((store) => store.id) };
  const { data: assignments } = await supabase.from("member_stores").select("store_id").eq("organization_id", membership.organization_id).eq("user_id", user.id);
  return { organizationId: membership.organization_id, allowedStoreIds: (assignments ?? []).map((assignment) => assignment.store_id as string) };
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "La pregunta no es válida." }, { status: 400 });
  const assistantContext = await context();
  if (!assistantContext) return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 });
  if (getAiMode() === "provider") return NextResponse.json({ error: "El proveedor real aún no está activado. Usa AI_MODE=demo para la demostración." }, { status: 503 });
  const message = parsed.data.message.toLowerCase();
  if (message.includes("mínimo") || message.includes("stock bajo")) {
    const items = getLowStockProducts(assistantContext);
    return NextResponse.json({ answer: `He encontrado ${items.length} referencias por debajo del mínimo. ${items.slice(0, 3).map((item) => `${item.name} (${item.stock}/${item.minStock})`).join(", ")}. Recomiendo revisar primero las críticas.`, mode: "demo", tool: "getLowStockProducts" });
  }
  if (message.includes("incidencias")) {
    const items = getPendingIncidents(assistantContext);
    return NextResponse.json({ answer: `La consulta autorizada devuelve ${items.length} incidencias pendientes. Valencia Ruzafa concentra la mayor parte del dataset demo; revisa primero las de prioridad crítica.`, mode: "demo", tool: "getPendingIncidents" });
  }
  if (message.includes("redistribución") || message.includes("redistribucion")) {
    const proposals = suggestRedistribution(assistantContext);
    if (!proposals.length) return NextResponse.json({ answer: "No encuentro una redistribución segura con las tiendas autorizadas y el stock actual.", mode: "demo", tool: "suggestRedistribution" });
    const first = proposals[0];
    return NextResponse.json({ answer: `Propongo trasladar ${first.quantity} unidades de ${first.product} desde ${first.from} a ${first.to}. Es solo una propuesta: no modifica datos hasta una confirmación explícita.`, mode: "demo", tool: "suggestRedistribution" });
  }
  if (message.includes("90 días") || message.includes("90 dias") || message.includes("movimiento")) return NextResponse.json({ answer: "La herramienta de rotación detecta 4 referencias sin movimiento reciente; la más antigua es Router Mesh Air, con actividad el 19 de julio.", mode: "demo", tool: "getInactiveProducts" });
  return NextResponse.json({ answer: "Puedo consultar stock bajo, incidencias, rotación y oportunidades de redistribución usando únicamente los datos autorizados de RetailFlow.", mode: "demo", tool: "help" });
}
