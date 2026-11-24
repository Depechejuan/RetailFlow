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
  return candidates.slice(0, 3).map((item) => ({ product: item.name, from: "Madrid Centro", to: stores.find((store) => store.id === item.storeId)?.name ?? "Tienda asignada", quantity: Math.max(1, item.minStock - item.stock) }));
}
