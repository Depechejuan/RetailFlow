import { Plus, Download } from "lucide-react";
import { AppShell, DemoNotice, PageHeader } from "@/components/app-shell";
import { InventoryTable } from "@/components/inventory-table";
import { inventory, stores } from "@/lib/demo-data";

export default function InventoryPage() {
  return <AppShell active="/inventory"><PageHeader eyebrow="Inventario · 30 referencias" title="Inventario" description="Consulta el estado de cada referencia por establecimiento y detecta las que necesitan atención." action={<div className="flex gap-2"><button className="inline-flex items-center gap-2 rounded-xl border border-[#dfe8e3] bg-white px-4 py-3 text-sm font-bold text-[#506168] hover:bg-[#f8faf8]"><Download size={16} /> Exportar</button><button className="inline-flex items-center gap-2 rounded-xl bg-[#10212b] px-4 py-3 text-sm font-bold text-white hover:bg-[#1c3b47]"><Plus size={16} /> Nuevo producto</button></div>} /><DemoNotice /><div className="mb-5 grid gap-3 sm:grid-cols-3">{stores.map((store, index) => <div key={store.id} className="panel rounded-2xl p-4"><p className="text-xs font-bold text-[#718187]">{store.name}</p><div className="mt-3 flex items-end justify-between"><span className="number-display text-2xl font-black">{[428, 397, 459][index]}</span><span className="text-xs font-bold text-[#557b23]">{["98%", "94%", "96%"][index]} saludable</span></div><div className="mt-3 h-1.5 rounded-full bg-[#eef2f0]"><div className="h-full rounded-full bg-[#b6e36b]" style={{ width: `${[98, 94, 96][index]}%` }} /></div></div>)}</div><InventoryTable items={inventory} /></AppShell>;
}
