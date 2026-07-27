import "dotenv/config";

type EsewaEnvironment = "sandbox" | "production";

function required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

export interface EsewaConfig {
    environment: EsewaEnvironment;
    productCode: string;
    secretKey: string;
    paymentUrl: string;
    successUrl: string;
    failureUrl: string;
    taxRatePercent: number;
    deliveryCharge: number;
    serviceCharge: number;
}

export function getEsewaConfig(): EsewaConfig {
    const environment = process.env.ESEWA_ENV === "production" ? "production" : "sandbox";
    const paymentUrl = process.env.ESEWA_PAYMENT_URL || (
        environment === "production"
            ? "https://epay.esewa.com.np/api/epay/main/v2/form"
            : "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
    );
    const parseNonNegative = (name: string) => {
        const value = Number(process.env[name] || 0);
        if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a non-negative number`);
        return value;
    };

    return {
        environment,
        productCode: required("ESEWA_PRODUCT_CODE"),
        secretKey: required("ESEWA_SECRET_KEY"),
        paymentUrl,
        successUrl: required("ESEWA_SUCCESS_URL"),
        failureUrl: required("ESEWA_FAILURE_URL"),
        taxRatePercent: parseNonNegative("CHECKOUT_TAX_RATE_PERCENT"),
        deliveryCharge: parseNonNegative("CHECKOUT_DELIVERY_CHARGE"),
        serviceCharge: parseNonNegative("CHECKOUT_SERVICE_CHARGE")
    };
}
