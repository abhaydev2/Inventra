import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { setupTestDb, clearTestDb } from "../../test-helper";
import { UserController } from "../../../src/controllers/user.controller";
import { UserModel } from "../../../src/models/user.model";

describe("User Controller Unit Tests", () => {
  const controller = new UserController();

beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("register returns 201 with saved user data", async () => {
    const req = {
      body: {
        firstName: "Controller",
        lastName: "User",
        email: "controller@test.com",
        username: "controlleruser",
        password: "password123",
        confirmPassword: "password123",
        role: "user",
        phone: "9876543210"
      }
    } as any;

    let responseStatus = 200;
    let responseData: any = null;

    const res = {
      status(code: number) {
        responseStatus = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      }
    } as any;

    await controller.register(req, res);

    assert.equal(responseStatus, 201);
    assert.equal(responseData.success, true);
    assert.equal(responseData.data.email, "controller@test.com");
  });

  test("login returns 200 with JWT token for valid credentials", async () => {
    // Seed user
    const password = await require("bcryptjs").hash("password123", 10);
    await UserModel.create({
      firstName: "Test",
      lastName: "Subject",
      email: "subject@test.com",
      username: "testsubject",
      password,
      role: "user"
    });

    const req = {
      body: {
        email: "subject@test.com",
        password: "password123"
      }
    } as any;

    let responseStatus = 200;
    let responseData: any = null;

    const res = {
      status(code: number) {
        responseStatus = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      }
    } as any;

    await controller.login(req, res);

    assert.equal(responseStatus, 200);
    assert.ok(responseData.data.token);
    assert.equal(responseData.data.user.email, "subject@test.com");
  });
});
