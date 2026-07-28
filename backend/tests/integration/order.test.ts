import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { clearTestDb, createTestUser, withServer } from "../test-helper";
import { ProductModel } from "../../src/models/product.model";
import { OrderModel } from "../../src/models/order.model";

describe("Order Integration Tests", () => {
beforeAll(async () => {
    await clearTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("POST /orders placing order reduces inventory stock levels in MongoDB", async () => {
    await withServer(async baseUrl => {
      const { token, user } = await createTestUser("user");

      // Seed product
      const product = await ProductModel.create({
        name: "Artisan Ceramic Mug Set",
        sku: "UT-CM-01",
        category: "Utensils",
        price: 1500,
        quantity: 20,
        lowStockThreshold: 2,
        createdBy: user._id
      });

      const orderPayload = {
        customerPhone: "9876543210",
        items: [
          {
            productId: product._id.toString(),
            name: "Artisan Ceramic Mug Set",
            price: 1500,
            quantity: 3
          }
        ],
        subtotal: 4500,
        discount: 0,
        total: 4500,
        status: "confirmed"
      };

      const response = await fetch(`${baseUrl}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const body = await response.json();
      assert.equal(response.status, 201);
      assert.equal(body.data.total, 4500);

      // Verify stock decremented
      const updatedProduct = await ProductModel.findById(product._id);
      assert.ok(updatedProduct);
      assert.equal(updatedProduct.quantity, 17); // 20 - 3
    });
  });

  test("POST /orders fails when requesting quantities above available stock", async () => {
    await withServer(async baseUrl => {
      const { token, user } = await createTestUser("user");

      const product = await ProductModel.create({
        name: "Fine Tip Gel Pens 10-Pack",
        sku: "ST-GP-02",
        category: "Stationery",
        price: 450,
        quantity: 5, // Only 5 in stock!
        lowStockThreshold: 1,
        createdBy: user._id
      });

      const orderPayload = {
        customerPhone: "9876543210",
        items: [
          {
            productId: product._id.toString(),
            name: "Fine Tip Gel Pens 10-Pack",
            price: 450,
            quantity: 10 // Requesting 10!
          }
        ],
        subtotal: 4500,
        discount: 0,
        total: 4500,
        status: "confirmed"
      };

      const response = await fetch(`${baseUrl}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      assert.equal(response.status, 400); // Bad Request (Insufficient stock)
    });
  });
});
