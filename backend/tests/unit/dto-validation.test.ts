import assert from "node:assert/strict";
import { describe, test } from "@jest/globals";
import { CreateAddressDTO, InitiateEsewaPaymentDTO, UpsertCartItemDTO } from "../../src/dtos/payment.dto";
import { CreateProductDTO, UpdateProductDTO } from "../../src/dtos/product.dto";
import { CreateUserDTO, UpdateUserDTO } from "../../src/dtos/user.dto";

const validProduct = {
  name: "Running Shoes",
  price: 4500,
  quantity: 20,
  category: "Shoes",
  sku: "SH-RUN-01",
};

const validUser = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  username: "janedoe",
  password: "password123",
};

const validAddress = {
  fullName: "Jane Doe",
  phone: "9800000000",
  line1: "123 Main Street",
  city: "Kathmandu",
  district: "Kathmandu",
};

describe("product DTO validation", () => {
  test("accepts a valid product and applies defaults", () => {
    const result = CreateProductDTO.parse(validProduct);
    assert.equal(result.lowStockThreshold, 10);
    assert.equal(result.salesCount, 0);
  });

  test("rejects an empty product name", () => assert.equal(CreateProductDTO.safeParse({ ...validProduct, name: "" }).success, false));
  test("rejects a negative price", () => assert.equal(CreateProductDTO.safeParse({ ...validProduct, price: -1 }).success, false));
  test("rejects a fractional quantity", () => assert.equal(CreateProductDTO.safeParse({ ...validProduct, quantity: 1.5 }).success, false));
  test("rejects an empty category", () => assert.equal(CreateProductDTO.safeParse({ ...validProduct, category: "" }).success, false));
  test("rejects an empty SKU", () => assert.equal(CreateProductDTO.safeParse({ ...validProduct, sku: "" }).success, false));
  test("accepts a null image", () => assert.equal(CreateProductDTO.safeParse({ ...validProduct, image: null }).success, true));
  test("allows an empty product update", () => assert.equal(UpdateProductDTO.safeParse({}).success, true));
});

describe("user DTO validation", () => {
  test("accepts a valid user and applies defaults", () => {
    const result = CreateUserDTO.parse(validUser);
    assert.equal(result.role, "user");
  });

  test("rejects an admin role for public registration", () => assert.equal(CreateUserDTO.safeParse({ ...validUser, role: "admin" }).success, false));
  test("rejects an invalid email", () => assert.equal(CreateUserDTO.safeParse({ ...validUser, email: "not-an-email" }).success, false));
  test("rejects a username shorter than three characters", () => assert.equal(CreateUserDTO.safeParse({ ...validUser, username: "ab" }).success, false));
  test("rejects a password shorter than six characters", () => assert.equal(CreateUserDTO.safeParse({ ...validUser, password: "short" }).success, false));
  test("rejects an unsupported role", () => assert.equal(CreateUserDTO.safeParse({ ...validUser, role: "manager" }).success, false));
  test("accepts a null phone number", () => assert.equal(CreateUserDTO.safeParse({ ...validUser, phone: null }).success, true));
  test("defaults to a user role for public registration", () => assert.equal(CreateUserDTO.parse(validUser).role, "user"));
  test("allows an empty user update", () => assert.equal(UpdateUserDTO.safeParse({}).success, true));
});

describe("payment DTO validation", () => {
  test("accepts a valid eSewa payment request", () => assert.equal(InitiateEsewaPaymentDTO.safeParse({ addressId: "507f1f77bcf86cd799439011" }).success, true));
  test("rejects an invalid delivery address id", () => assert.equal(InitiateEsewaPaymentDTO.safeParse({ addressId: "invalid" }).success, false));
  test("trims a coupon code", () => assert.equal(InitiateEsewaPaymentDTO.parse({ addressId: "507f1f77bcf86cd799439011", couponCode: " SAVE10 " }).couponCode, "SAVE10"));
  test("rejects a coupon code longer than 64 characters", () => assert.equal(InitiateEsewaPaymentDTO.safeParse({ addressId: "507f1f77bcf86cd799439011", couponCode: "x".repeat(65) }).success, false));
  test("accepts a cart item quantity from one to 100", () => assert.equal(UpsertCartItemDTO.safeParse({ productId: "507f1f77bcf86cd799439011", quantity: 1 }).success, true));
  test("rejects an invalid cart product id", () => assert.equal(UpsertCartItemDTO.safeParse({ productId: "invalid", quantity: 1 }).success, false));
  test("rejects a cart quantity of zero", () => assert.equal(UpsertCartItemDTO.safeParse({ productId: "507f1f77bcf86cd799439011", quantity: 0 }).success, false));
  test("rejects a cart quantity above 100", () => assert.equal(UpsertCartItemDTO.safeParse({ productId: "507f1f77bcf86cd799439011", quantity: 101 }).success, false));
});

describe("address DTO validation", () => {
  test("accepts a complete delivery address", () => assert.equal(CreateAddressDTO.safeParse(validAddress).success, true));
  test("trims address names", () => assert.equal(CreateAddressDTO.parse({ ...validAddress, fullName: " Jane Doe " }).fullName, "Jane Doe"));
  test("rejects a one-character full name", () => assert.equal(CreateAddressDTO.safeParse({ ...validAddress, fullName: "J" }).success, false));
  test("rejects a phone number shorter than seven characters", () => assert.equal(CreateAddressDTO.safeParse({ ...validAddress, phone: "123456" }).success, false));
  test("rejects a line-one address shorter than three characters", () => assert.equal(CreateAddressDTO.safeParse({ ...validAddress, line1: "12" }).success, false));
  test("rejects a city shorter than two characters", () => assert.equal(CreateAddressDTO.safeParse({ ...validAddress, city: "K" }).success, false));
});
