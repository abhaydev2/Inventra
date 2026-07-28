import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { setupTestDb, clearTestDb } from "../../test-helper";
import { ProductController } from "../../../src/controllers/product.controller";
import { ProductModel } from "../../../src/models/product.model";

describe("Product Controller Unit Tests", () => {
  const controller = new ProductController();
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

  test("createProduct returns 201 on success", async () => {
    const req = {
      body: {
        name: "Controller Running Shoes",
        sku: "SH-RUN-CTRL",
        category: "Shoes",
        price: 4500,
        quantity: 20,
        lowStockThreshold: 5
      },
      user: {
        _id: mockUserId
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

    await controller.createProduct(req, res);

    assert.equal(responseStatus, 201);
    assert.equal(responseData.success, true);
    assert.equal(responseData.data.sku, "SH-RUN-CTRL");
  });

  test("getProduct returns 404 for non-existent product", async () => {
    const req = {
      params: {
        id: new mongoose.Types.ObjectId().toString()
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

    await controller.getProduct(req, res);

    assert.equal(responseStatus, 404);
  });
});
