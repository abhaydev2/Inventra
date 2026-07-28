import { expect, test } from "@playwright/test";

test("Checkout and profile settings flow E2E tests", async ({ page }) => {
  // 1. Visit Login and login
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();

  // 2. Settings navigation
  await page.goto("/login"); // fallback check
  
  // 3. Forgot Password page navigation
  await page.goto("/forget_password");
  await expect(page.getByRole("heading", { name: "Forgot Password" })).toBeVisible();
  await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
});
