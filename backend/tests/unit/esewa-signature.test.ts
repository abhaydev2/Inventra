import assert from "node:assert/strict";
import { test } from "@jest/globals";
import { createEsewaSignature, money } from "../../src/utils/esewa-signature.util";

test("money formats rupee amounts to exactly two decimals", () => {
  assert.equal(money(25), "25.00");
  assert.equal(money(10.235), "10.24");
  assert.equal(money(0.1 + 0.2), "0.30");
});

test("eSewa signature is stable for the same signed payment fields", () => {
  const signature = createEsewaSignature({ totalAmount: "100.00", transactionUuid: "order-123", productCode: "EPAYTEST", secretKey: "sandbox-secret" });
  assert.equal(signature, "DNarVOtweQbG8XpfI2p6/cxZjL6euebWLo3OkWQcFj0=");
});
