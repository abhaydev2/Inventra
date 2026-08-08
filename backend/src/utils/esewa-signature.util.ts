import crypto from "crypto";

export const ESEWA_SIGNED_FIELD_NAMES = "total_amount,transaction_uuid,product_code";

export function createEsewaSignature(input: {
    totalAmount: string;
    transactionUuid: string;
    productCode: string;
    secretKey: string;
}): string {
    const message = `total_amount=${input.totalAmount},transaction_uuid=${input.transactionUuid},product_code=${input.productCode}`;
    return crypto.createHmac("sha256", input.secretKey).update(message, "utf8").digest("base64");
}

export function createEsewaResponseSignature(
    fields: Record<string, unknown>,
    signedFieldNames: string,
    secretKey: string
): string {
    const names = signedFieldNames.split(",").map(name => name.trim()).filter(Boolean);
    const message = names.map(name => `${name}=${String(fields[name] ?? "")}`).join(",");
    return crypto.createHmac("sha256", secretKey).update(message, "utf8").digest("base64");
}

export function signaturesMatch(expected: string, received: string): boolean {
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    return expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function money(value: number): string {
    return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
}
