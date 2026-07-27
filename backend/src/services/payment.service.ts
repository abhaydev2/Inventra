import crypto from "crypto";
import mongoose from "mongoose";
import { CartModel } from "../models/cart.model";
import { ProductModel } from "../models/product.model";
import { OrderModel, IOrderItem } from "../models/order.model";
import { PaymentModel } from "../models/payment.model";
import { HttpException } from "../exceptions/http-exception";
import { AddressService } from "./address.service";
import { getEsewaConfig } from "../configs/esewa.config";
import { createEsewaSignature, ESEWA_SIGNED_FIELD_NAMES, money } from "../utils/esewa-signature.util";
import { NotificationService } from "./notification.service";

const coupons: Record<string, { kind: "percentage" | "fixed"; value: number }> = { SHOELOVE20: { kind: "percentage", value: 20 }, FIRST10: { kind: "percentage", value: 10 }, HIVE500: { kind: "fixed", value: 500 }, WELCOME50: { kind: "percentage", value: 50 } };

export class PaymentService {
    private addressService = new AddressService();
    private notificationService = new NotificationService();
    async initiateEsewa(user: { _id: mongoose.Types.ObjectId; firstName: string; lastName: string; email: string }, addressId: string, couponCode?: string) {
        const config = getEsewaConfig();
        const [cart, address] = await Promise.all([CartModel.findOne({ userId: user._id }), this.addressService.owned(user._id.toString(), addressId)]);
        if (!cart?.items.length) throw new HttpException(400, "Your cart is empty");
        const ids = cart.items.map(i => i.productId); const products = await ProductModel.find({ _id: { $in: ids } });
        const byId = new Map(products.map(p => [p._id.toString(), p]));
        const items: IOrderItem[] = cart.items.map(item => {
            const product = byId.get(item.productId.toString());
            if (!product) throw new HttpException(404, "A cart product no longer exists");
            if (product.quantity < item.quantity) throw new HttpException(409, `Insufficient stock for ${product.name}`);
            return { productId: product._id.toString(), name: product.name, price: product.price, quantity: item.quantity };
        });
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const code = couponCode?.trim().toUpperCase(); const coupon = code ? coupons[code] : undefined;
        if (code && !coupon) throw new HttpException(400, "Invalid coupon code");
        const discount = coupon ? Math.min(subtotal, coupon.kind === "percentage" ? Math.round(subtotal * coupon.value) / 100 : coupon.value) : 0;
        const amount = Math.max(0, subtotal - discount); const taxAmount = Math.round(amount * config.taxRatePercent) / 100;
        const total = Math.round((amount + taxAmount + config.serviceCharge + config.deliveryCharge) * 100) / 100;
        const existing = await PaymentModel.findOne({ userId: user._id, provider: "esewa", status: { $in: ["pending", "initiated"] }, createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } }).sort({ createdAt: -1 });
        if (existing) return { paymentUrl: config.paymentUrl, paymentFields: existing.initiationFields, reused: true };
        const transactionUuid = `esewa-${crypto.randomUUID()}`;
        const fields: Record<string, string> = { amount: money(amount), tax_amount: money(taxAmount), total_amount: money(total), transaction_uuid: transactionUuid, product_code: config.productCode, product_service_charge: money(config.serviceCharge), product_delivery_charge: money(config.deliveryCharge), success_url: config.successUrl, failure_url: config.failureUrl, signed_field_names: ESEWA_SIGNED_FIELD_NAMES, signature: "" };
        fields.signature = createEsewaSignature({ totalAmount: fields.total_amount, transactionUuid, productCode: config.productCode, secretKey: config.secretKey });
        const order = await OrderModel.create({ customerId: user._id, customerName: `${user.firstName} ${user.lastName}`.trim(), customerEmail: user.email, customerPhone: address.phone, shippingAddress: { fullName: address.fullName, phone: address.phone, line1: address.line1, line2: address.line2, city: address.city, district: address.district }, items, subtotal, discount, taxAmount, deliveryCharge: config.deliveryCharge, serviceCharge: config.serviceCharge, total, couponApplied: code || "", paymentMethod: "esewa", paymentStatus: "initiated", status: "pending_payment" });
        await PaymentModel.create({ userId: user._id, orderId: order._id, provider: "esewa", method: "esewa", transactionUuid, expectedAmount: total, status: "initiated", initiationFields: fields, initiatedAt: new Date() });
        await Promise.all([
            this.notificationService.create({ audience: "admin", type: "payment", title: "eSewa payment initiated", message: `${user.email} started an eSewa payment for Rs. ${money(total)}. It remains pending verification.`, metadata: { orderId: order._id.toString(), transactionUuid } }),
            this.notificationService.create({ audience: "user", recipientUserId: user._id, type: "payment", title: "eSewa payment initiated", message: "You were redirected to eSewa. Your order will be confirmed only after secure payment verification.", metadata: { orderId: order._id.toString(), transactionUuid } })
        ]);
        return { paymentUrl: config.paymentUrl, paymentFields: fields, reused: false };
    }
}
