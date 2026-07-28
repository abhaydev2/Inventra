import { expect, test } from "@playwright/test";

test("home page exposes the primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /smart inventory management system/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Login", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register", exact: true })).toBeVisible();
});

test("login page renders email and password fields", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  await expect(page.getByPlaceholder("Enter email")).toBeVisible();
  await expect(page.getByPlaceholder("Enter password")).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot Password?" })).toBeVisible();
});

test("register page renders account details fields", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
  await expect(page.getByPlaceholder("Enter first name")).toBeVisible();
  await expect(page.getByPlaceholder("Enter phone number")).toBeVisible();
  await expect(page.getByRole("button", { name: /register/i })).toBeVisible();
});
