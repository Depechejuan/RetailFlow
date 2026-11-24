export type Role = "admin" | "supervisor" | "employee";
export type ProductStatus = "active" | "archived";
export type MovementType = "receipt" | "shipment" | "transfer" | "adjustment";
export type IncidentStatus = "open" | "in_progress" | "resolved";
export type IncidentPriority = "low" | "medium" | "high" | "critical";

export type Store = {
  id: string;
  name: string;
  city: string;
  code: string;
  manager: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  status: ProductStatus;
};

export type InventoryItem = Product & {
  stock: number;
  storeId: string;
  lastMovement: string;
  health: "healthy" | "low" | "critical";
};

export type Movement = {
  id: string;
  type: MovementType;
  productId: string;
  productName: string;
  quantity: number;
  sourceStore?: string;
  destinationStore?: string;
  occurredAt: string;
  actor: string;
  note: string;
};

export type Incident = {
  id: string;
  type: string;
  description: string;
  productName: string;
  storeName: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  owner: string;
  createdAt: string;
};

export type MovementCommand = {
  type: MovementType;
  productId: string;
  quantity: number;
  sourceStoreId?: string;
  destinationStoreId?: string;
  adjustmentDelta?: number;
  idempotencyKey: string;
  note?: string;
};
