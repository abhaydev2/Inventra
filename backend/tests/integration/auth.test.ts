import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { clearTestDb, createTestUser, withServer } from "../test-helper";
import { UserModel } from "../../src/models/user.model";

describe("Auth Integration Tests", () => {
beforeAll(async () => {
    await clearTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("POST /auth/register creates a user successfully in MongoDB", async () => {
    await withServer(async baseUrl => {
      const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          username: "johndoe",
          password: "password123",
          confirmPassword: "password123",
          role: "user",
          phone: "9876543210"
        })
      });

      const body = await response.json();
      assert.equal(response.status, 201);
      assert.equal(body.success, true);
      assert.equal(body.data.email, "john@example.com");

      // Verify user exists in DB
      const user = await UserModel.findOne({ email: "john@example.com" });
      assert.ok(user);
      assert.equal(user.username, "johndoe");
    });
  });

  test("POST /auth/register fails with duplicate email", async () => {
    await withServer(async baseUrl => {
      // Create user first
      await createTestUser();
      
      const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com", // This will be duplicated if we use a fixed email in createTestUser helper
          username: "johndoe",
          password: "password123",
          confirmPassword: "password123",
          role: "user",
          phone: "9876543210"
        })
      });

      // Let's register twice with the same email directly
      const payload = {
        firstName: "Jane",
        lastName: "Smith",
        email: "duplicate@example.com",
        username: "janesmith",
        password: "password123",
        confirmPassword: "password123",
        role: "user",
        phone: "9876543210"
      };

      const res1 = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      assert.equal(res1.status, 201);

      const res2 = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      assert.equal(res2.status, 400); // Bad Request (Email already exists)
    });
  });

  test("POST /auth/login returns token for valid credentials", async () => {
    await withServer(async baseUrl => {
      // Register user
      const payload = {
        firstName: "Test",
        lastName: "User",
        email: "login@example.com",
        username: "loginuser",
        password: "password123",
        confirmPassword: "password123",
        role: "user",
        phone: "9876543210"
      };

      await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Login
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "login@example.com",
          password: "password123"
        })
      });

      const body = await response.json();
      assert.equal(response.status, 200);
      assert.ok(body.data.token);
      assert.equal(body.data.user.email, "login@example.com");
    });
  });

  test("GET /auth/whoami yields user details when authenticating with bearer token", async () => {
    await withServer(async baseUrl => {
      const { user, token } = await createTestUser();

      const response = await fetch(`${baseUrl}/api/v1/auth/whoami`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.data.email, user.email);
      assert.equal(body.data.role, "user");
    });
  });
});
