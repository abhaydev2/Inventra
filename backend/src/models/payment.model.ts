import mongoose, { Schema, Document } from "mongoose";

export type PaymentStatus = "pending" | "initiated" | "completed" | "failed" | "cancelled";
export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId; orderId: mongoose.Types.ObjectId; provider: "esewa"; method: "esewa";
    transactionUuid: string; expectedAmount: number; status: PaymentStatus; initiationFields: Record<string, string>;
    esewaReferenceId?: string; verificationResponse?: Record<string, unknown>; initiatedAt?: Date; createdAt: Date; updatedAt: Date;
}
const paymentSchema = new Schema<IPayment>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    provider: { type: String, enum: ["esewa"], required: true }, method: { type: String, enum: ["esewa"], required: true },
    transactionUuid: { type: String, required: true, unique: true, index: true }, expectedAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "initiated", "completed", "failed", "cancelled"], default: "pending", index: true },
    initiationFields: { type: Schema.Types.Mixed, required: true }, esewaReferenceId: String, verificationResponse: Schema.Types.Mixed, initiatedAt: Date
}, { timestamps: true });
export const PaymentModel = mongoose.model<IPayment>("Payment", paymentSchema);
