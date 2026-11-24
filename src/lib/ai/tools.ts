import { incidents, inventory, stores } from "@/lib/demo-data";

export type AssistantContext = { organizationId: string; allowedStoreIds: string[] };

export function getLowStockProducts(context: AssistantContext) {
  return inventory.filter((item) => context.allowedStoreIds.includes(item.storeId) && item.health !== "healthy");
}

export function getPendingIncidents(context: AssistantContext) {
  const allowedStores = new Set(context.allowedStoreIds.map((id) => stores.find((store) => store.id === id)?.name));
  return incidents.filter((incident) => incident.status !== "resolved" && allowedStores.has(incident.storeName));
}

export function suggestRedistribution(context: AssistantContext) {
  const candidates = getLowStockProducts(context);
  return candidates.flatMap((item) => {
    const donor = inventory.find((candidate) => candidate.id === item.id && candidate.storeId !== item.storeId && context.allowedStoreIds.includes(candidate.storeId) && candidate.health === "healthy" && candidate.stock > candidate.minStock);
    if (!donor) return [];
    return [{ product: item.name, from: stores.find((store) => store.id === donor.storeId)?.name ?? "Tienda origen", to: stores.find((store) => store.id === item.storeId)?.name ?? "Tienda destino", quantity: Math.min(donor.stock - donor.minStock, Math.max(1, item.minStock - item.stock)) }];
  }).slice(0, 3);
}
