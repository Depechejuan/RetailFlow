import type { Category, Incident, InventoryItem, Movement, Product, Store } from "@/lib/types";

export const stores: Store[] = [
  { id: "store-madrid", code: "MAD-01", name: "Madrid Centro", city: "Madrid", manager: "Laura Martín" },
  { id: "store-valencia", code: "VAL-02", name: "Valencia Ruzafa", city: "Valencia", manager: "Sergio Gil" },
  { id: "store-sevilla", code: "SEV-03", name: "Sevilla Nervión", city: "Sevilla", manager: "Marta León" },
];

export const categories: Category[] = [
  { id: "cat-audio", name: "Audio", color: "#8b5cf6" },
  { id: "cat-movilidad", name: "Movilidad", color: "#22c55e" },
  { id: "cat-hogar", name: "Hogar conectado", color: "#06b6d4" },
  { id: "cat-accesorios", name: "Accesorios", color: "#f59e0b" },
  { id: "cat-cuidado", name: "Cuidado personal", color: "#f43f5e" },
];

const productNames = [
  ["Auriculares Orbit X1", "cat-audio"], ["Altavoz Nova Mini", "cat-audio"], ["Barra Sonora Arc", "cat-audio"],
  ["Micrófono Studio One", "cat-audio"], ["Cascos Pulse Max", "cat-audio"], ["Batería Volt 20K", "cat-accesorios"],
  ["Cargador GaN 65W", "cat-accesorios"], ["Cable USB-C Trenzado", "cat-accesorios"], ["Hub Connect 7", "cat-accesorios"],
  ["Soporte Desk Arm", "cat-accesorios"], ["Patinete Urban S", "cat-movilidad"], ["Luz Bike Beam", "cat-movilidad"],
  ["Candado Smart Lock", "cat-movilidad"], ["Casco Metro Safe", "cat-movilidad"], ["Bomba Air Pocket", "cat-movilidad"],
  ["Cámara Home View", "cat-hogar"], ["Sensor Door Sense", "cat-hogar"], ["Enchufe Link Mini", "cat-hogar"],
  ["Bombilla Glow E27", "cat-hogar"], ["Router Mesh Air", "cat-hogar"], ["Cepillo Sonic Clean", "cat-cuidado"],
  ["Báscula Body Scan", "cat-cuidado"], ["Masajeador Go", "cat-cuidado"], ["Espejo Light Pro", "cat-cuidado"],
  ["Difusor Air Mood", "cat-cuidado"], ["Cable Lightning Pro", "cat-accesorios"], ["Dock Charge 3", "cat-accesorios"],
  ["Auriculares Wave Lite", "cat-audio"], ["Altavoz Terra", "cat-audio"], ["Lámpara Desk Halo", "cat-hogar"],
] as const;

export const products: Product[] = productNames.map(([name, categoryId], index) => ({
  id: `product-${index + 1}`,
  sku: `RF-${String(index + 1).padStart(3, "0")}`,
  name,
  categoryId,
  costPrice: 18 + (index % 8) * 11,
  salePrice: 39 + (index % 8) * 19,
  minStock: 8 + (index % 5) * 3,
  status: "active",
}));

export const inventory: InventoryItem[] = products.map((product, index) => {
  const stock = 4 + ((index * 13) % 44);
  const health = stock <= product.minStock / 2 ? "critical" : stock <= product.minStock ? "low" : "healthy";
  return {
    ...product,
    stock,
    storeId: stores[index % stores.length].id,
    lastMovement: index % 7 === 0 ? "2026-07-19" : `2026-11-${String(24 - (index % 18)).padStart(2, "0")}`,
    health,
  };
});

export const movements: Movement[] = [
  { id: "mov-001", type: "transfer", productId: "product-7", productName: "Cargador GaN 65W", quantity: 18, sourceStore: "Madrid Centro", destinationStore: "Valencia Ruzafa", occurredAt: "2026-11-24T08:42:00", actor: "Laura Martín", note: "Reposición por demanda" },
  { id: "mov-002", type: "receipt", productId: "product-16", productName: "Cámara Home View", quantity: 32, destinationStore: "Sevilla Nervión", occurredAt: "2026-11-24T08:18:00", actor: "Sergio Gil", note: "Recepción proveedor Novatek" },
  { id: "mov-003", type: "shipment", productId: "product-3", productName: "Barra Sonora Arc", quantity: 4, sourceStore: "Madrid Centro", occurredAt: "2026-11-23T17:26:00", actor: "Ana Rojas", note: "Venta ecommerce" },
  { id: "mov-004", type: "adjustment", productId: "product-21", productName: "Cepillo Sonic Clean", quantity: 2, sourceStore: "Valencia Ruzafa", occurredAt: "2026-11-23T15:05:00", actor: "Sergio Gil", note: "Diferencia en conteo" },
  { id: "mov-005", type: "receipt", productId: "product-11", productName: "Patinete Urban S", quantity: 12, destinationStore: "Madrid Centro", occurredAt: "2026-11-22T10:14:00", actor: "Laura Martín", note: "Reposición semanal" },
  { id: "mov-006", type: "shipment", productId: "product-28", productName: "Auriculares Wave Lite", quantity: 7, sourceStore: "Sevilla Nervión", occurredAt: "2026-11-21T12:02:00", actor: "Marta León", note: "Pedido tienda" },
];

export const incidents: Incident[] = [
  { id: "INC-2048", type: "Diferencia de inventario", description: "Faltan 3 unidades tras el conteo de apertura.", productName: "Cargador GaN 65W", storeName: "Valencia Ruzafa", status: "open", priority: "high", owner: "Sergio Gil", createdAt: "2026-11-24" },
  { id: "INC-2047", type: "Producto dañado", description: "Caja dañada durante la recepción del proveedor.", productName: "Cámara Home View", storeName: "Sevilla Nervión", status: "in_progress", priority: "medium", owner: "Marta León", createdAt: "2026-11-23" },
  { id: "INC-2046", type: "Recepción incompleta", description: "El albarán indica 20 unidades, llegaron 18.", productName: "Auriculares Orbit X1", storeName: "Madrid Centro", status: "open", priority: "critical", owner: "Laura Martín", createdAt: "2026-11-22" },
  { id: "INC-2045", type: "Diferencia de inventario", description: "Conteo físico corregido con ajuste compensatorio.", productName: "Cepillo Sonic Clean", storeName: "Valencia Ruzafa", status: "resolved", priority: "low", owner: "Sergio Gil", createdAt: "2026-11-20" },
  { id: "INC-2044", type: "Producto extraviado", description: "Unidad no localizada en zona de picking.", productName: "Router Mesh Air", storeName: "Madrid Centro", status: "resolved", priority: "medium", owner: "Ana Rojas", createdAt: "2026-11-18" },
];

export const categoryName = (id: string) => categories.find((category) => category.id === id)?.name ?? "Sin categoría";
export const storeName = (id: string) => stores.find((store) => store.id === id)?.name ?? "Sin tienda";
