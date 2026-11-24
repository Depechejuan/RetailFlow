import Link from "next/link";
import { Activity, Boxes, CircleAlert, LayoutDashboard, MessageSquareText, PackageSearch, Settings2, Store } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventario", icon: Boxes },
  { href: "/movements", label: "Movimientos", icon: Activity },
  { href: "/incidents", label: "Incidencias", icon: CircleAlert },
  { href: "/assistant", label: "Asistente IA", icon: MessageSquareText },
];

export function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-[#dfe8e3] bg-[#10212b] text-white lg:min-h-screen lg:w-[248px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-6 py-6 lg:block">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b6e36b] text-[#10212b]"><PackageSearch size={21} strokeWidth={2.5} /></span>
            <span><span className="block text-[17px] font-black tracking-[-.04em]">RetailFlow</span><span className="block text-[10px] font-semibold tracking-[.16em] text-[#9db0b7]">INVENTORY OS</span></span>
          </Link>
          <div className="hidden pt-10 lg:block"><p className="eyebrow text-[#8fa5ad]">Operaciones</p></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:px-3 lg:pb-0">
          {links.map(({ href, label, icon: Icon }) => {
            const selected = active === href;
            return <Link key={href} href={href} className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${selected ? "bg-[#b6e36b] text-[#10212b]" : "text-[#b7c5c9] hover:bg-white/10 hover:text-white"}`}><Icon size={17} /><span>{label}</span>{label === "Incidencias" && <span className="ml-auto rounded-full bg-[#df6c58] px-1.5 py-0.5 text-[10px] text-white">3</span>}</Link>;
          })}
        </nav>
        <div className="mt-auto hidden space-y-1 px-3 pb-5 lg:block">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#dce7e9]"><span className="h-2 w-2 rounded-full bg-[#b6e36b]" /> Demo activo</div><p className="text-[11px] leading-relaxed text-[#91a5ac]">Datos reproducibles para explorar RetailFlow sin conectar credenciales.</p></div>
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[#b7c5c9] hover:bg-white/10 hover:text-white"><Settings2 size={17} /> Configuración</Link>
        </div>
      </aside>
      <main className="shell-grid min-h-screen flex-1"><div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10 lg:py-9">{children}</div></main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow mb-2">{eyebrow}</p><h1 className="text-3xl font-black tracking-[-.055em] text-[#10212b] sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#64747c]">{description}</p></div>{action}</header>;
}

export function DemoNotice() { return <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#dceabf] bg-[#f1f9df] px-4 py-3 text-xs font-semibold text-[#557b23]"><Store size={16} /><span>Modo demostración · las cifras proceden de un dataset reproducible de RetailFlow.</span></div>; }
