import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { setupTestDb, clearTestDb } from "../../test-helper";
import { ProductMongoRepository } from "../../../src/repositories/product.repository";
import { ProductModel } from "../../../src/models/product.model";

describe("Product Repository Unit Tests", () => {
  const repo = new ProductMongoRepository();
  const mockUserId = new mongoose.Types.ObjectId();

beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("createProduct stores new product in MongoDB", async () => {
    const product = await repo.createProduct({
      name: "Running Shoes",
      sku: "SH-RUN-01",
      category: "Shoes",
      price: 4500,
      quantity: 15,
      lowStockThreshold: 5,
      createdBy: mockUserId
    });

    assert.ok(product._id);
    assert.equal(product.sku, "SH-RUN-01");

    const saved = await ProductModel.findOne({ sku: "SH-RUN-01" });
    assert.ok(saved);
    assert.equal(saved.name, "Running Shoes");
  });

  test("getProductBySku retrieves product by SKU", async () => {
    await ProductModel.create({
      name: "Leather Boots",
      sku: "SH-LEA-02",
      category: "Shoes",
      price: 6500,
      quantity: 10,
      lowStockThreshold: 3,
      createdBy: mockUserId
    });

    const product = await repo.getProductBySku("SH-LEA-02");
    assert.ok(product);
    assert.equal(product.name, "Leather Boots");
  });

  test("getLowStockProducts finds items with quantity <= lowStockThreshold", async () => {
    // 1. Normal stock product
    await ProductModel.create({
      name: "Smart Watch",
      sku: "EL-SW-02",
      category: "Electronics",
      price: 5000,
      quantity: 12,
      lowStockThreshold: 3,
      createdBy: mockUserId
    });

    // 2. Low stock product
    await ProductModel.create({
      name: "Fitness Band",
      sku: "EL-FB-03",
      category: "Electronics",
      price: 3000,
      quantity: 2, // Stock is 2, threshold is 3
      lowStockThreshold: 3,
      createdBy: mockUserId
    });

    const lowStockList = await repo.getLowStockProducts();
    assert.equal(lowStockList.length, 1);
    assert.equal(lowStockList[0].sku, "EL-FB-03");
  });
});
