import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../src/configs/constant";
import { connectToMongoDBTest } from "../src/database/mongodb";
import { UserModel } from "../src/models/user.model";
import { ProductModel } from "../src/models/product.model";
import { OrderModel } from "../src/models/order.model";
import { PaymentModel } from "../src/models/payment.model";
import app from "../src/app";

let dbConnected = false;

export async function setupTestDb() {
  if (!dbConnected) {
    await connectToMongoDBTest();
    dbConnected = true;
  }
}

export async function clearTestDb() {
  await setupTestDb();
  await UserModel.deleteMany({});
  await ProductModel.deleteMany({});
  await OrderModel.deleteMany({});
  await PaymentModel.deleteMany({});
}

export async function teardownTestDb() {
  if (dbConnected) {
    await mongoose.connection.close();
    dbConnected = false;
  }
}

export async function createTestUser(role: "admin" | "user" = "user") {
  await setupTestDb();
  const email = `${role}-test-${Date.now()}-${Math.random()}@test.com`;
  const username = `testuser_${role}_${Date.now()}`;
  // Hashed password fallback (bcryptjs)
  const password = await require("bcryptjs").hash("password123", 10);
  
  const user = await UserModel.create({
    firstName: "Test",
    lastName: role === "admin" ? "Admin" : "User",
    email,
    username,
    password,
    role,
    phone: "9876543210"
  });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return { user, token };
}

export async function withServer(run: (baseUrl: string) => Promise<void>) {
  await setupTestDb();
  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not start");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}
