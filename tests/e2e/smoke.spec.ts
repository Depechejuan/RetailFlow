import { expect, test } from "@playwright/test";

test("la demo muestra el resumen operativo", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Buenos días, Laura" })).toBeVisible();
  await expect(page.getByText("Productos activos")).toBeVisible();
});

test("los flujos demo exponen búsqueda, asistente y formularios", async ({ page }) => {
  await page.goto("/inventory");
  await page.getByPlaceholder("Buscar por nombre o SKU").fill("Cargador");
  await expect(page.getByText("Cargador GaN 65W", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Auriculares Orbit X1", { exact: true })).toHaveCount(0);

  await page.goto("/assistant");
  await page.getByRole("button", { name: "¿Qué tienda tiene más incidencias?" }).click();
  await expect(page.getByText("Valencia Ruzafa concentra la mayor parte", { exact: false })).toBeVisible();

  await page.goto("/movements/new");
  await expect(page.getByRole("heading", { name: "Registrar movimiento" })).toBeVisible();
  await page.goto("/incidents/new");
  await expect(page.getByRole("heading", { name: "Registrar incidencia" })).toBeVisible();
});
