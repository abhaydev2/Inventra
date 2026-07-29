import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { setupTestDb, clearTestDb } from "../../test-helper";
import { UserService } from "../../../src/services/user.service";
import { UserModel } from "../../../src/models/user.model";

describe("User Service Unit Tests", () => {
  const service = new UserService();

beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("createUser registers user and prevents duplicates", async () => {
    const payload = {
      firstName: "Service",
      lastName: "Tester",
      email: "service@test.com",
      username: "servicetest",
      password: "password123",
      role: "user" as const,
      wishlist: []
    };

    const user = await service.createUser(payload);
    assert.ok(user._id);
    assert.equal(user.email, "service@test.com");

    // Prevent duplicate email registration
    await assert.rejects(
      service.createUser({
        ...payload,
        username: "differentusername"
      }),
      /Email already exists/
    );

    // Prevent duplicate username registration
    await assert.rejects(
      service.createUser({
        ...payload,
        email: "different@test.com"
      }),
      /Username already exists/
    );
  });

  test("loginUser issues JWT token for valid credentials", async () => {
    // Register first
    await service.createUser({
      firstName: "Login",
      lastName: "User",
      email: "login@test.com",
      username: "loginuser",
      password: "correctpassword",
      role: "user" as const,
      wishlist: []
    });

    // Valid login
    const result = await service.loginUser({
      email: "login@test.com",
      password: "correctpassword"
    });

    assert.ok(result.token);
    assert.equal(result.user.email, "login@test.com");

    // Invalid password login
    await assert.rejects(
      service.loginUser({
        email: "login@test.com",
        password: "wrongpassword"
      }),
      /Invalid email or password/
    );

    // Invalid email login
    await assert.rejects(
      service.loginUser({
        email: "unregistered@test.com",
        password: "correctpassword"
      }),
      /Email not registered/
    );
  });

  test("requestPasswordReset creates a token and resetPassword updates the password", async () => {
    await service.createUser({
      firstName: "Reset",
      lastName: "User",
      email: "reset@test.com",
      username: "resetuser",
      password: "oldpassword",
      role: "user" as const,
      wishlist: []
    });

    const resetRequest = await service.requestPasswordReset("reset@test.com");
    assert.ok(resetRequest.resetToken);

    await service.resetPassword(resetRequest.resetToken, "newpassword123");

    const updatedUser = await UserModel.findOne({ email: "reset@test.com" });
    assert.ok(updatedUser);
    const isPasswordValid = await bcryptjs.compare("newpassword123", updatedUser!.password);
    assert.equal(isPasswordValid, true);
  });
});
