import { describe, expect, it } from "vitest";
import { inventoryValue, stockHealth, validateMovement } from "@/lib/inventory";

describe("reglas de inventario", () => {
  it("clasifica el stock crítico, bajo y saludable", () => {
    expect(stockHealth(3, 10)).toBe("critical");
    expect(stockHealth(8, 10)).toBe("low");
    expect(stockHealth(20, 10)).toBe("healthy");
  });

  it("rechaza un traspaso sin stock suficiente", () => {
    const errors = validateMovement({ type: "transfer", productId: "p1", quantity: 11, sourceStoreId: "s1", destinationStoreId: "s2", idempotencyKey: "retry-1" }, 10);
    expect(errors).toContain("No hay stock suficiente en la tienda de origen.");
  });

  it("calcula el valor a precio de coste", () => {
    expect(inventoryValue([{ stock: 4, costPrice: 10 }, { stock: 2, costPrice: 25 }])).toBe(90);
  });
});
