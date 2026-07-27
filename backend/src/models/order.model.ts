import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface IOrder extends Document {
    customerId?: mongoose.Types.ObjectId;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: IOrderItem[];
    subtotal: number;
    discount: number;
    taxAmount: number;
    deliveryCharge: number;
    serviceCharge: number;
    total: number;
    couponApplied?: string;
    shippingAddress?: { fullName: string; phone: string; line1: string; line2?: string; city: string; district: string };
    paymentMethod: "cod" | "esewa";
    paymentStatus: "pending" | "initiated" | "completed" | "failed" | "cancelled";
    status: "draft" | "pending_payment" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const OrderMongoSchema: Schema = new Schema<IOrder>(
    {
        customerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, default: "" },
        items: [
            {
                productId: { type: String, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true }
            }
        ],
        subtotal: { type: Number, required: true },
        discount: { type: Number, required: true, default: 0 },
        taxAmount: { type: Number, required: true, default: 0 },
        deliveryCharge: { type: Number, required: true, default: 0 },
        serviceCharge: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true },
        couponApplied: { type: String, default: "" },
        shippingAddress: {
            fullName: String, phone: String, line1: String, line2: String, city: String, district: String
        },
        paymentMethod: { type: String, enum: ["cod", "esewa"], default: "cod", required: true },
        paymentStatus: { type: String, enum: ["pending", "initiated", "completed", "failed", "cancelled"], default: "pending", required: true },
        status: {
            type: String, 
            enum: ["draft", "pending_payment", "confirmed", "processing", "shipped", "delivered", "cancelled"], 
            default: "confirmed" 
        }
    },
    {
        timestamps: true
    }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderMongoSchema);
