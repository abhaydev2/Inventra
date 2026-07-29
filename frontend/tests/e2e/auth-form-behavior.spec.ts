import { expect, test } from "@playwright/test";

test.describe("registration form behavior", () => {
  test("does not expose a role selector for public registration", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("select")).toHaveCount(0);
  });

  test("uses an email input for the registration email", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder("Enter email")).toHaveAttribute("type", "email");
  });

  test("disables browser autocomplete for registration identity fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder("Enter first name")).toHaveAttribute("autocomplete", "off");
    await expect(page.getByPlaceholder("Enter email")).toHaveAttribute("autocomplete", "off");
  });

  test("keeps registration password fields masked initially", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder("Enter password")).toHaveAttribute("type", "password");
    await expect(page.getByPlaceholder("Confirm password")).toHaveAttribute("type", "password");
  });

  test("renders the registration password visibility control as a non-submit button", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator(".eye_btn").nth(0)).toHaveAttribute("type", "button");
  });

  test("renders the confirmation-password visibility control as a non-submit button", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator(".eye_btn").nth(1)).toHaveAttribute("type", "button");
  });

  test("uses separate autocomplete fields for the registration passwords", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByPlaceholder("Enter password")).toHaveAttribute("autocomplete", "new-password");
    await expect(page.getByPlaceholder("Confirm password")).toHaveAttribute("autocomplete", "new-password");
  });

  test("renders a validation message slot for every registration field", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator(".input_group span")).toHaveCount(7);
  });

  test("accepts username text in the registration field", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Enter username").fill("ab");
    await expect(page.getByPlaceholder("Enter username")).toHaveValue("ab");
  });

  test("retains registration email text entered by the user", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Enter email").fill("not-an-email");
    await expect(page.getByPlaceholder("Enter email")).toHaveValue("not-an-email");
  });

  test("accepts phone input in the registration form", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Enter phone number").fill("123456789");
    await expect(page.getByPlaceholder("Enter phone number")).toHaveValue("123456789");
  });

  test("accepts password input in the registration form", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Enter password").fill("12345");
    await expect(page.getByPlaceholder("Enter password")).toHaveValue("12345");
  });

  test("keeps password and confirmation inputs separate", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Enter password").fill("password123");
    await page.getByPlaceholder("Confirm password").fill("different-password");
    await expect(page.getByPlaceholder("Enter password")).toHaveValue("password123");
    await expect(page.getByPlaceholder("Confirm password")).toHaveValue("different-password");
  });
});

test.describe("login form behavior", () => {
  test("shows the login instruction text", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Login to continue Inventory System")).toBeVisible();
  });

  test("uses a text input for the login email", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("Enter email")).toHaveAttribute("type", "text");
  });

  test("renders the login password visibility control as a non-submit button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator(".eye_btn")).toHaveAttribute("type", "button");
  });

  test("masks the login password again after a second visibility click", async ({ page }) => {
    await page.goto("/login");
    await page.locator(".eye_btn").click();
    await page.locator(".eye_btn").click();
    await expect(page.getByPlaceholder("Enter password")).toHaveAttribute("type", "password");
  });

  test("retains login email text entered by the user", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Enter email").fill("invalid");
    await expect(page.getByPlaceholder("Enter email")).toHaveValue("invalid");
  });

  test("accepts password text in the login form", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Enter password").fill("12345");
    await expect(page.getByPlaceholder("Enter password")).toHaveValue("12345");
  });

  test("initializes the login fields as empty", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("Enter email")).toHaveValue("");
    await expect(page.getByPlaceholder("Enter password")).toHaveValue("");
  });

  test("disables browser autocomplete for the login form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("Enter email")).toHaveAttribute("autocomplete", "off");
    await expect(page.getByPlaceholder("Enter password")).toHaveAttribute("autocomplete", "new-password");
  });
});

test.describe("password recovery forms", () => {
  test("shows the forgot-password instructions", async ({ page }) => {
    await page.goto("/forget_password");
    await expect(page.getByText("Enter your email to reset password")).toBeVisible();
  });

  test("accepts an email in the forgot-password form", async ({ page }) => {
    await page.goto("/forget_password");
    const email = page.getByPlaceholder("Enter your email");
    await email.fill("jane@example.com");
    await expect(email).toHaveValue("jane@example.com");
  });

  test("names the forgot-password email field", async ({ page }) => {
    await page.goto("/forget_password");
    await expect(page.getByPlaceholder("Enter your email")).toHaveAttribute("name", "email");
  });

  test("returns to login from the forgot-password page", async ({ page }) => {
    await page.goto("/forget_password");
    await page.getByRole("link", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("shows reset-password instructions", async ({ page }) => {
    await page.goto("/reset_password");
    await expect(page.getByText("Create a new password")).toBeVisible();
  });

  test("accepts both reset-password field values", async ({ page }) => {
    await page.goto("/reset_password");
    await page.getByPlaceholder("Enter new password").fill("new-password");
    await page.getByPlaceholder("Confirm password").fill("new-password");
    await expect(page.getByPlaceholder("Confirm password")).toHaveValue("new-password");
  });

  test("names the reset-password field", async ({ page }) => {
    await page.goto("/reset_password");
    await expect(page.getByPlaceholder("Enter new password")).toHaveAttribute("name", "password");
  });

  test("names the password-confirmation field", async ({ page }) => {
    await page.goto("/reset_password");
    await expect(page.getByPlaceholder("Confirm password")).toHaveAttribute("name", "confirmPassword");
  });

  test("returns to login from the reset-password page", async ({ page }) => {
    await page.goto("/reset_password");
    await page.getByRole("link", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
