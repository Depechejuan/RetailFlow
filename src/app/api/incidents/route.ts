import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/data-source";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ type: z.string().trim().min(2).max(80), description: z.string().trim().min(5).max(1000), productId: z.string().uuid().optional(), storeId: z.string().uuid(), priority: z.enum(["low", "medium", "high", "critical"]) });

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) return NextResponse.json({ error: "El modo demo es de lectura. Configura Supabase para crear incidencias." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los campos de la incidencia." }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 });
  const { data: membership } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).eq("active", true).limit(1).maybeSingle();
  if (!membership) return NextResponse.json({ error: "No tienes una organización activa." }, { status: 403 });
  const { data, error } = await supabase.from("incidents").insert({ ...parsed.data, organization_id: membership.organization_id, reported_by_user_id: user.id }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
