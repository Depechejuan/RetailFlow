import { AppShell } from "@/components/app-shell";
import { IncidentForm } from "@/components/incident-form";
import { loadCatalog } from "@/lib/repositories/catalog";

export default async function NewIncidentPage() { const catalog = await loadCatalog(); return <AppShell active="/incidents"><IncidentForm products={catalog.products} stores={catalog.stores} /></AppShell>; }
