export function hasSupabaseConfig() {
  return process.env.RETAILFLOW_DEMO_E2E !== "1" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
