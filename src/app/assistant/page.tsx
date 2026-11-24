import { MessageSquareText } from "lucide-react";
import { AppShell, DemoNotice, PageHeader } from "@/components/app-shell";
import { AssistantConsole } from "@/components/assistant-console";

export default function AssistantPage() { return <AppShell active="/assistant"><PageHeader eyebrow="Inteligencia operativa · 6 herramientas" title="Asistente IA" description="Pregunta por el estado de la red, detecta excepciones y convierte datos dispersos en una siguiente acción clara." action={<div className="flex items-center gap-2 rounded-xl border border-[#dfe8e3] bg-white px-3 py-2.5 text-xs font-bold text-[#557b23]"><MessageSquareText size={15} /> Modo lectura</div>} /><DemoNotice /><AssistantConsole /></AppShell>; }
