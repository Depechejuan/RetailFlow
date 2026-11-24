import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/data-source";
import { applyMovement } from "@/lib/commands/movements";

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) return NextResponse.json({ error: "El modo demo es de lectura. Configura Supabase para registrar movimientos." }, { status: 503 });
  try { return NextResponse.json({ id: await applyMovement(await request.json()) }, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo registrar el movimiento." }, { status: 400 }); }
}
