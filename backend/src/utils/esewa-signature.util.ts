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

export function money(value: number): string {
    return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
}
