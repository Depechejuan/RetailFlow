import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions";
import { getLowStockProducts, suggestRedistribution } from "@/lib/ai/tools";

describe("autorización y herramientas IA", () => {
  it("mantiene la matriz de permisos por rol", () => {
    expect(can("admin", "settings:write")).toBe(true);
    expect(can("supervisor", "settings:write")).toBe(false);
    expect(can("employee", "movement:write")).toBe(true);
  });

  it("filtra herramientas por tiendas autorizadas", () => {
    const context = { organizationId: "demo", allowedStoreIds: ["store-madrid"] };
    expect(getLowStockProducts(context).every((item) => item.storeId === "store-madrid")).toBe(true);
    expect(suggestRedistribution(context).every((proposal) => proposal.from !== proposal.to)).toBe(true);
  });
});
