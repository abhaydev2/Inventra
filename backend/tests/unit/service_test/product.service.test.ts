import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { setupTestDb, clearTestDb } from "../../test-helper";
import { ProductService } from "../../../src/services/product.service";
import { ProductModel } from "../../../src/models/product.model";

describe("Product Service Unit Tests", () => {
  const service = new ProductService();
  const mockUserId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("createProduct registers product and enforces unique SKU constraint", async () => {
    const payload = {
      name: "Running Shoes",
      sku: "SH-RUN-01",
      category: "Shoes",
      price: 4500,
      quantity: 20,
      lowStockThreshold: 5,
      salesCount: 0
    };

    const product = await service.createProduct(payload, mockUserId);
    assert.ok(product._id);
    assert.equal(product.sku, "SH-RUN-01");

    // Try creating duplicate SKU
    await assert.rejects(
      service.createProduct({
        ...payload,
        name: "Different Shoes"
      }, mockUserId),
      /SKU already exists/
    );
  });

  test("getProduct throws 404 for missing items", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await assert.rejects(
      service.getProduct(fakeId),
      /Product not found/
    );
  });

  test("getDashboardStats calculates catalog aggregate values", async () => {
    // Seed two products
    await ProductModel.create({
      name: "Notebook",
      sku: "ST-NB-01",
      category: "Stationery",
      price: 800,
      quantity: 10,
      lowStockThreshold: 2,
      createdBy: new mongoose.Types.ObjectId()
    });

    await ProductModel.create({
      name: "Pen Pack",
      sku: "ST-PP-02",
      category: "Stationery",
      price: 200,
      quantity: 5,
      lowStockThreshold: 2,
      createdBy: new mongoose.Types.ObjectId()
    });

    const stats = await service.getDashboardStats();
    assert.equal(stats.totalProducts, 2);
    assert.equal(stats.totalStock, 15); // 10 + 5
    assert.equal(stats.totalInventoryValue, 9000); // (800*10) + (200*5)
  });
});
