import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { clearTestDb, createTestUser, withServer } from "../test-helper";
import { ProductModel } from "../../src/models/product.model";

describe("Product Integration Tests", () => {
beforeAll(async () => {
    await clearTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("GET /products returns 401 Unauthorized without auth headers", async () => {
    await withServer(async baseUrl => {
      const response = await fetch(`${baseUrl}/api/v1/products`);
      assert.equal(response.status, 401);
    });
  });

  test("POST /products adds a product and saves it in MongoDB", async () => {
    await withServer(async baseUrl => {
      const { token } = await createTestUser("admin");
      
      const payload = {
        name: "Test cricket bat",
        sku: "SP-CR-99",
        category: "Sports",
        price: 3200,
        quantity: 10,
        lowStockThreshold: 2,
        description: "Finest quality english willow",
        image: "http://example.com/bat.jpg"
      };

      const response = await fetch(`${baseUrl}/api/v1/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();
      assert.equal(response.status, 201);
      assert.equal(body.data.sku, "SP-CR-99");

      // Verify DB contains product
      const product = await ProductModel.findOne({ sku: "SP-CR-99" });
      assert.ok(product);
      assert.equal(product.name, "Test cricket bat");
    });
  });

  test("DELETE /products/:id prevents standard users from removing stock", async () => {
    await withServer(async baseUrl => {
      const { token: userToken, user } = await createTestUser("user");
      const { token: adminToken } = await createTestUser("admin");

      // Create product
      const product = await ProductModel.create({
        name: "Smart Watch",
        sku: "EL-SW-10",
        category: "Electronics",
        price: 9000,
        quantity: 5,
        lowStockThreshold: 1,
        createdBy: user._id
      });

      // Try deleting as normal user
      const userDeleteResponse = await fetch(`${baseUrl}/api/v1/products/${product._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      assert.equal(userDeleteResponse.status, 403); // Forbidden

      // Delete as admin
      const adminDeleteResponse = await fetch(`${baseUrl}/api/v1/products/${product._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      assert.equal(adminDeleteResponse.status, 200);

      // Verify product is deleted
      const checkDeleted = await ProductModel.findById(product._id);
      assert.equal(checkDeleted, null);
    });
  });
});
