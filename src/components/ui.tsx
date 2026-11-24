import { ArrowDownLeft, ArrowUpRight, Minus, TriangleAlert } from "lucide-react";

export function Kpi({ label, value, change, tone = "lime", note }: { label: string; value: string; change?: string; tone?: "lime" | "amber" | "red" | "blue"; note?: string }) {
  const dots = { lime: "bg-[#b6e36b]", amber: "bg-[#f2b84b]", red: "bg-[#df6c58]", blue: "bg-[#8bd6df]" };
  return <div className="panel rounded-2xl p-5"><div className="flex items-start justify-between"><p className="eyebrow">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${dots[tone]}`} /></div><p className="number-display mt-6 text-3xl font-black">{value}</p>{change && <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#557b23]"><ArrowUpRight size={14} /> {change}</p>}{note && <p className="mt-2 text-xs text-[#7c8c91]">{note}</p>}</div>;
}

export function Status({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  const styles = { neutral: "bg-[#eef2f0] text-[#65767c]", success: "bg-[#e9f7d2] text-[#557b23]", warning: "bg-[#fff2d4] text-[#9a6810]", danger: "bg-[#fde8e4] text-[#a74738]", info: "bg-[#e1f5f7] text-[#26727b]" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ${styles[tone]}`}>{children}</span>;
}

export function MovementIcon({ type }: { type: "receipt" | "shipment" | "transfer" | "adjustment" }) {
  const config = { receipt: { icon: ArrowDownLeft, className: "bg-[#e9f7d2] text-[#557b23]" }, shipment: { icon: ArrowUpRight, className: "bg-[#fde8e4] text-[#a74738]" }, transfer: { icon: ArrowDownLeft, className: "bg-[#e1f5f7] text-[#26727b]" }, adjustment: { icon: Minus, className: "bg-[#fff2d4] text-[#9a6810]" } }[type];
  const Icon = config.icon;
  return <span className={`grid h-9 w-9 place-items-center rounded-xl ${config.className}`}><Icon size={16} /></span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="panel flex min-h-40 flex-col items-center justify-center rounded-2xl p-8 text-center"><TriangleAlert className="mb-3 text-[#f2b84b]" size={22} /><h3 className="font-bold">{title}</h3><p className="mt-1 max-w-sm text-sm text-[#718187]">{description}</p></div>; }
