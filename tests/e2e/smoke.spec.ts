import { expect, test } from "@playwright/test";

test("la demo muestra el resumen operativo", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Buenos días, Laura" })).toBeVisible();
  await expect(page.getByText("Productos activos")).toBeVisible();
});
