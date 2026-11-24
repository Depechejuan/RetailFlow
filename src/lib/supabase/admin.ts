import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Falta la configuración secreta de Supabase para una tarea administrativa.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
