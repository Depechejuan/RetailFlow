import { incidents, inventory, movements, products } from "@/lib/demo-data";
import { inventoryValue } from "@/lib/inventory";

export const dashboardStats = {
  products: products.length,
  totalStock: inventory.reduce((total, item) => total + item.stock, 0),
  inventoryValue: inventoryValue(inventory),
  lowStock: inventory.filter((item) => item.health !== "healthy").length,
  pendingIncidents: incidents.filter((incident) => incident.status !== "resolved").length,
  recentMovements: movements.slice(0, 5),
  activity: [38, 52, 44, 68, 57, 76, 64, 86, 71, 93, 81, 88],
};
