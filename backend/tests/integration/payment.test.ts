// Mock environment variables for config validation
process.env.ESEWA_PRODUCT_CODE = "EPAYTEST";
process.env.ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";
process.env.ESEWA_SUCCESS_URL = "http://localhost:3000/checkout/success";
process.env.ESEWA_FAILURE_URL = "http://localhost:3000/checkout/failure";

import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, test } from "@jest/globals";
import mongoose from "mongoose";
import { clearTestDb, createTestUser, withServer } from "../test-helper";
import { ProductModel } from "../../src/models/product.model";
import { AddressModel } from "../../src/models/address.model";
import { CartModel } from "../../src/models/cart.model";
import { PaymentModel } from "../../src/models/payment.model";
import { OrderModel } from "../../src/models/order.model";

describe("eSewa Payment Integration Tests", () => {
beforeAll(async () => {
    await clearTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

afterAll(async () => {
    await mongoose.connection.close();
  });

  test("POST /payments/esewa/initiate fails with 401 for unauthenticated requests", async () => {
    await withServer(async baseUrl => {
      const response = await fetch(`${baseUrl}/api/v1/payments/esewa/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: new mongoose.Types.ObjectId().toString()
        })
      });
      assert.equal(response.status, 401);
    });
  });

  test("POST /payments/esewa/initiate fails with 400 when user cart is empty", async () => {
    await withServer(async baseUrl => {
      const { token, user } = await createTestUser("user");
      
      const address = await AddressModel.create({
        userId: user._id,
        fullName: "Test Recipient",
        phone: "9876543210",
        line1: "House 10, Road 4",
        city: "Kathmandu",
        district: "Kathmandu",
        isDefault: true
      });

      const response = await fetch(`${baseUrl}/api/v1/payments/esewa/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId: address._id.toString()
        })
      });

      const body = await response.json();
      assert.equal(response.status, 400);
      assert.equal(body.message, "Your cart is empty");
    });
  });

  test("POST /payments/esewa/initiate initiates payment successfully with valid signatures and items", async () => {
    await withServer(async baseUrl => {
      const { token, user } = await createTestUser("user");
      
      // Create address
      const address = await AddressModel.create({
        userId: user._id,
        fullName: "Test Recipient",
        phone: "9876543210",
        line1: "House 10, Road 4",
        city: "Kathmandu",
        district: "Kathmandu",
        isDefault: true
      });

      // Create product
      const product = await ProductModel.create({
        name: "Artisan Ceramic Mug Set",
        sku: "UT-CM-01",
        category: "Utensils",
        price: 1500,
        quantity: 20,
        lowStockThreshold: 2,
        createdBy: user._id
      });

      // Populate user cart in database
      await CartModel.create({
        userId: user._id,
        items: [
          {
            productId: product._id,
            quantity: 2
          }
        ]
      });

      const response = await fetch(`${baseUrl}/api/v1/payments/esewa/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId: address._id.toString()
        })
      });

      const body = await response.json();
      assert.equal(response.status, 201);
      assert.equal(body.success, true);
      
      const fields = body.data.paymentFields;
      assert.ok(fields);
      assert.equal(fields.amount, "3000.00"); // 1500 * 2
      assert.ok(fields.signature);
      assert.equal(fields.signed_field_names, "total_amount,transaction_uuid,product_code");

      // Verify pending payment & pending order records are created
      const paymentRecord = await PaymentModel.findOne({ userId: user._id });
      assert.ok(paymentRecord);
      assert.equal(paymentRecord.status, "initiated");
      assert.equal(paymentRecord.expectedAmount, Number(fields.total_amount));

      const orderRecord = await OrderModel.findOne({ customerEmail: user.email });
      assert.ok(orderRecord);
      assert.equal(orderRecord.status, "pending_payment");
    });
  });
});
