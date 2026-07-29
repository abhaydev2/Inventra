import { expect, test } from "@playwright/test";

test("home Get Started opens the login page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("home Create Account opens the registration page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test("home shows the inventory overview metrics", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Total Products", { exact: true })).toBeVisible();
  await expect(page.getByText("Low Stock Items", { exact: true })).toBeVisible();
  await expect(page.getByText("Orders Today", { exact: true })).toBeVisible();
});

test("home Login navigation opens the login page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
});

test("login password is hidden by default", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByPlaceholder("Enter password")).toHaveAttribute("type", "password");
});

test("login provides a password visibility control", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator(".eye_btn")).toBeVisible();
});

test("login accepts email and password input", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Enter email").fill("jane@example.com");
  await page.getByPlaceholder("Enter password").fill("password123");
  await expect(page.getByPlaceholder("Enter email")).toHaveValue("jane@example.com");
  await expect(page.getByPlaceholder("Enter password")).toHaveValue("password123");
});

test("login Forgot Password link opens the reset request page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot Password?" }).click();
  await expect(page).toHaveURL(/\/forget_password$/);
  await expect(page.getByRole("heading", { name: "Forgot Password" })).toBeVisible();
});

test("login Register link opens the registration page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Register", exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test("registration provides password visibility controls", async ({ page }) => {
  await page.goto("/register");
  await expect(page.locator(".eye_btn")).toHaveCount(2);
});

test("registration exposes all account-detail fields", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByPlaceholder("Enter first name")).toBeVisible();
  await expect(page.getByPlaceholder("Enter last name")).toBeVisible();
  await expect(page.getByPlaceholder("Enter username")).toBeVisible();
  await expect(page.getByPlaceholder("Enter phone number")).toBeVisible();
});

test("registration accepts account details before submission", async ({ page }) => {
  await page.goto("/register");
  await page.getByPlaceholder("Enter first name").fill("Jane");
  await page.getByPlaceholder("Enter last name").fill("Doe");
  await page.getByPlaceholder("Enter username").fill("janedoe");
  await page.getByPlaceholder("Enter email").fill("jane@example.com");
  await page.getByPlaceholder("Enter phone number").fill("9800000000");
  await page.getByPlaceholder("Enter password").fill("password123");
  await page.getByPlaceholder("Confirm password").fill("password123");
  await expect(page.getByPlaceholder("Confirm password")).toHaveValue("password123");
});

test("forgot password uses an email input", async ({ page }) => {
  await page.goto("/forget_password");
  await expect(page.getByPlaceholder("Enter your email")).toHaveAttribute("type", "email");
});

test("forgot password confirms that a reset link was sent", async ({ page }) => {
  await page.goto("/forget_password");
  await page.getByPlaceholder("Enter your email").fill("jane@example.com");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Send Reset Link" }).click();
});

test("reset password keeps both password fields masked", async ({ page }) => {
  await page.goto("/reset_password");
  await expect(page.getByPlaceholder("Enter new password")).toHaveAttribute("type", "password");
  await expect(page.getByPlaceholder("Confirm password")).toHaveAttribute("type", "password");
});

test("reset password confirms a successful submission", async ({ page }) => {
  await page.goto("/reset_password");
  await page.getByPlaceholder("Enter new password").fill("new-password");
  await page.getByPlaceholder("Confirm password").fill("new-password");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset Password" }).click();
});
