import type { InventoryItem, MovementCommand } from "@/lib/types";

export function stockHealth(stock: number, minimum: number): InventoryItem["health"] {
  if (stock <= minimum / 2) return "critical";
  if (stock <= minimum) return "low";
  return "healthy";
}

export function validateMovement(command: MovementCommand, currentStock: number): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(command.quantity) || command.quantity <= 0) errors.push("La cantidad debe ser mayor que cero.");
  if (!command.idempotencyKey.trim()) errors.push("La operación necesita una clave de idempotencia.");
  if (command.type === "transfer") {
    if (!command.sourceStoreId || !command.destinationStoreId) errors.push("Un traspaso necesita origen y destino.");
    if (command.sourceStoreId === command.destinationStoreId) errors.push("El origen y el destino deben ser distintos.");
    if (command.quantity > currentStock) errors.push("No hay stock suficiente en la tienda de origen.");
  }
  if (command.type === "shipment" && command.quantity > currentStock) errors.push("No hay stock suficiente para la salida.");
  if (command.type === "adjustment" && !Number.isFinite(command.adjustmentDelta)) errors.push("Un ajuste necesita una diferencia válida.");
  return errors;
}

export function inventoryValue(items: Array<Pick<InventoryItem, "stock" | "costPrice">>): number {
  return items.reduce((total, item) => total + item.stock * item.costPrice, 0);
}
