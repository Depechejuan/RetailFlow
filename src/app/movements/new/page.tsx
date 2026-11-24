import { AppShell } from "@/components/app-shell";
import { MovementForm } from "@/components/movement-form";
import { loadCatalog } from "@/lib/repositories/catalog";

export default async function NewMovementPage() { const catalog = await loadCatalog(); return <AppShell active="/movements"><MovementForm products={catalog.products} stores={catalog.stores} /></AppShell>; }
