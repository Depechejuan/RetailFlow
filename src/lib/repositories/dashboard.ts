import { products } from "@/lib/demo-data";
import { inventoryValue } from "@/lib/inventory";
import { loadIncidents } from "@/lib/repositories/incidents";
import { loadInventory } from "@/lib/repositories/inventory";
import { loadMovements } from "@/lib/repositories/movements";

export async function loadDashboard() {
  const [inventory, incidents, movements] = await Promise.all([loadInventory(), loadIncidents(), loadMovements()]);
  return {
    products: new Set(inventory.map((item) => item.id)).size || products.length,
    totalStock: inventory.reduce((total, item) => total + item.stock, 0),
    inventoryValue: inventoryValue(inventory),
    lowStock: inventory.filter((item) => item.health !== "healthy").length,
    pendingIncidents: incidents.filter((incident) => incident.status !== "resolved").length,
    recentMovements: movements.slice(0, 5),
    activity: [38, 52, 44, 68, 57, 76, 64, 86, 71, 93, 81, 88],
  };
}
