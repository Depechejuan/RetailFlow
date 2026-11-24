"use client";

import { RefreshCcw, TriangleAlert } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#f4f7f5] px-5"><div className="panel max-w-lg rounded-2xl p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff2d4] text-[#9a6810]"><TriangleAlert size={22} /></span><h1 className="mt-5 text-2xl font-black tracking-[-.04em]">No se pudo cargar este espacio</h1><p className="mt-3 text-sm leading-6 text-[#718187]">Comprueba que las migraciones de Supabase están aplicadas y que el usuario tiene una organización asignada.</p><button onClick={() => reset()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#10212b] px-4 py-3 text-sm font-black text-white"><RefreshCcw size={16} /> Reintentar</button></div></main>;
}
