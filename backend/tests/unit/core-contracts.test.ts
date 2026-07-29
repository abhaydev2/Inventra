import assert from "node:assert/strict";
import { describe, jest, test } from "@jest/globals";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../../src/dtos/admin-user.dto";
import { LoginUserDTO } from "../../src/dtos/user.dto";
import { HttpException } from "../../src/exceptions/http-exception";
import { ApiResponseHelper } from "../../src/utils/apihelper.util";
import { createEsewaSignature, money } from "../../src/utils/esewa-signature.util";

const validUser = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  username: "janedoe",
  password: "password123",
  role: "user" as const,
};

type MockApiPayload = {
  status: number;
  success: boolean;
  message: string;
  data: unknown;
  meta?: unknown;
};

function mockResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

function payloadOf(response: ReturnType<typeof mockResponse>): MockApiPayload {
  return response.json.mock.calls[0][0] as MockApiPayload;
}

describe("ApiResponseHelper", () => {
  test("sends a successful response with default values", () => {
    const response = mockResponse();
    assert.equal(ApiResponseHelper.success(response as never, { id: 1 }), response);
    assert.equal(response.status.mock.calls.length, 1);
    assert.equal(response.status.mock.calls[0][0], 200);
    const payload = payloadOf(response);
    assert.equal(payload.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.message, "Success");
    assert.equal((payload.data as { id: number }).id, 1);
    assert.equal(payload.meta, undefined);
  });

  test("uses a supplied success status and message", () => {
    const response = mockResponse();
    ApiResponseHelper.success(response as never, ["saved"], "Created", 201);
    assert.deepEqual(response.json.mock.calls[0][0], { status: 201, success: true, message: "Created", data: ["saved"], meta: undefined });
  });

  test("includes pagination metadata in successful responses", () => {
    const response = mockResponse();
    const meta = { page: 2, limit: 20, total: 45 };
    ApiResponseHelper.success(response as never, [], "Products", 200, meta);
    assert.equal(payloadOf(response).meta, meta);
  });

  test("sends a default error response", () => {
    const response = mockResponse();
    ApiResponseHelper.error(response as never);
    assert.deepEqual(response.json.mock.calls[0][0], { status: 500, success: false, message: "Error", data: null });
  });

  test("uses a supplied error status and message", () => {
    const response = mockResponse();
    ApiResponseHelper.error(response as never, "Not found", 404);
    assert.equal(response.status.mock.calls.length, 1);
    assert.equal(response.status.mock.calls[0][0], 404);
    assert.equal(payloadOf(response).message, "Not found");
  });

  test("normalizes undefined error data to null", () => {
    const response = mockResponse();
    ApiResponseHelper.error(response as never, "Bad request", 400, undefined);
    assert.equal(payloadOf(response).data, null);
  });
});

describe("HttpException", () => {
  test("is an Error instance", () => assert.ok(new HttpException(400, "Invalid") instanceof Error));
  test("preserves the provided status", () => assert.equal(new HttpException(403, "Forbidden").status, 403));
  test("preserves the provided message", () => assert.equal(new HttpException(404, "Missing").message, "Missing"));
});

describe("eSewa helpers", () => {
  test("formats zero as a currency amount", () => assert.equal(money(0), "0.00"));
  test("formats whole rupees with two decimals", () => assert.equal(money(42), "42.00"));
  test("rounds a single decimal place", () => assert.equal(money(12.3), "12.30"));
  test("rounds values up at the third decimal", () => assert.equal(money(1.235), "1.24"));
  test("avoids common floating-point rounding errors", () => assert.equal(money(1.005), "1.01"));
  test("rounds down below the half-cent boundary", () => assert.equal(money(9.994), "9.99"));
  test("formats negative values consistently", () => assert.equal(money(-4.5), "-4.50"));

  test("creates the expected HMAC-SHA256 base64 signature", () => {
    assert.equal(createEsewaSignature({ totalAmount: "100.00", transactionUuid: "order-1", productCode: "EPAYTEST", secretKey: "secret" }), "CHAr3YunBIotKaW/BUneoXlqddQpZjT3FrWsdsTo/KM=");
  });

  test("changes the signature when the amount changes", () => {
    const base = { transactionUuid: "order-1", productCode: "EPAYTEST", secretKey: "secret" };
    assert.notEqual(createEsewaSignature({ ...base, totalAmount: "100.00" }), createEsewaSignature({ ...base, totalAmount: "101.00" }));
  });

  test("changes the signature when the transaction changes", () => {
    const base = { totalAmount: "100.00", productCode: "EPAYTEST", secretKey: "secret" };
    assert.notEqual(createEsewaSignature({ ...base, transactionUuid: "order-1" }), createEsewaSignature({ ...base, transactionUuid: "order-2" }));
  });

  test("changes the signature when the secret key changes", () => {
    const base = { totalAmount: "100.00", transactionUuid: "order-1", productCode: "EPAYTEST" };
    assert.notEqual(createEsewaSignature({ ...base, secretKey: "secret" }), createEsewaSignature({ ...base, secretKey: "other-secret" }));
  });
});

describe("login DTO validation", () => {
  test("accepts valid login credentials", () => assert.equal(LoginUserDTO.safeParse({ email: validUser.email, password: validUser.password }).success, true));
  test("rejects an invalid login email", () => assert.equal(LoginUserDTO.safeParse({ email: "wrong", password: validUser.password }).success, false));
  test("rejects a missing email", () => assert.equal(LoginUserDTO.safeParse({ password: validUser.password }).success, false));
  test("rejects a short password", () => assert.equal(LoginUserDTO.safeParse({ email: validUser.email, password: "short" }).success, false));
  test("rejects a missing password", () => assert.equal(LoginUserDTO.safeParse({ email: validUser.email }).success, false));
  test("rejects an empty credentials object", () => assert.equal(LoginUserDTO.safeParse({}).success, false));
});

describe("admin user DTO validation", () => {
  test("allows an administrator role when creating a user", () => assert.equal(AdminCreateUserDTO.parse({ ...validUser, role: "admin" }).role, "admin"));
  test("allows a standard user role when creating a user", () => assert.equal(AdminCreateUserDTO.safeParse(validUser).success, true));
  test("rejects an invalid role when creating a user", () => assert.equal(AdminCreateUserDTO.safeParse({ ...validUser, role: "manager" }).success, false));
  test("rejects a missing first name when creating a user", () => assert.equal(AdminCreateUserDTO.safeParse({ ...validUser, firstName: "" }).success, false));
  test("rejects an invalid email when creating a user", () => assert.equal(AdminCreateUserDTO.safeParse({ ...validUser, email: "invalid" }).success, false));
  test("rejects a short password when creating a user", () => assert.equal(AdminCreateUserDTO.safeParse({ ...validUser, password: "12345" }).success, false));

  test("allows an empty admin user update", () => assert.equal(AdminUpdateUserDTO.safeParse({}).success, true));
  test("allows updating just a first name", () => assert.equal(AdminUpdateUserDTO.parse({ firstName: "Janet" }).firstName, "Janet"));
  test("allows changing a role to administrator", () => assert.equal(AdminUpdateUserDTO.parse({ role: "admin" }).role, "admin"));
  test("rejects an invalid role update", () => assert.equal(AdminUpdateUserDTO.safeParse({ role: "manager" }).success, false));
  test("rejects a short username update", () => assert.equal(AdminUpdateUserDTO.safeParse({ username: "ab" }).success, false));
  test("rejects an invalid email update", () => assert.equal(AdminUpdateUserDTO.safeParse({ email: "invalid" }).success, false));
  test("rejects a short password update", () => assert.equal(AdminUpdateUserDTO.safeParse({ password: "12345" }).success, false));
});
