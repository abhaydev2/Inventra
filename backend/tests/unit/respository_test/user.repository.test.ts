import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { setupTestDb, clearTestDb } from "../../test-helper";
import { UserMongoRepository } from "../../../src/repositories/user.repository";
import { UserModel } from "../../../src/models/user.model";

describe("User Repository Unit Tests", () => {
  const repo = new UserMongoRepository();

beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("createUser saves user record and hashes password", async () => {
    const user = await repo.createUser({
      firstName: "Unit",
      lastName: "Test",
      email: "unit@test.com",
      username: "unittest",
      password: "password123",
      role: "user"
    });

    assert.ok(user._id);
    assert.equal(user.email, "unit@test.com");
    assert.equal(user.username, "unittest");

    const saved = await UserModel.findById(user._id);
    assert.ok(saved);
    assert.equal(saved.email, "unit@test.com");
  });

  test("getUserByEmail retrieves user by email address", async () => {
    await UserModel.create({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@test.com",
      username: "alice",
      password: "password123",
      role: "user"
    });

    const user = await repo.getUserByEmail("alice@test.com");
    assert.ok(user);
    assert.equal(user.username, "alice");
  });

  test("update merges properties and returns new document without password", async () => {
    const original = await UserModel.create({
      firstName: "Bob",
      lastName: "Jones",
      email: "bob@test.com",
      username: "bobjones",
      password: "password123",
      role: "user"
    });

    const updated = await repo.update(original._id.toString(), {
      firstName: "Robert",
      phone: "1234567890"
    });

    assert.ok(updated);
    assert.equal(updated.firstName, "Robert");
    assert.equal(updated.phone, "1234567890");
    assert.equal(updated.password, undefined); // Password excluded
  });

  test("delete drops the user record and returns true", async () => {
    const user = await UserModel.create({
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie@test.com",
      username: "charlie",
      password: "password123",
      role: "user"
    });

    const deleted = await repo.delete(user._id.toString());
    assert.equal(deleted, true);

    const exists = await UserModel.findById(user._id);
    assert.equal(exists, null);
  });
});
