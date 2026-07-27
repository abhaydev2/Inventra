import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
    userId: mongoose.Types.ObjectId; fullName: string; phone: string; line1: string; line2?: string; city: string; district: string; isDefault: boolean; createdAt: Date; updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true }, phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true }, line2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true }, district: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export const AddressModel = mongoose.model<IAddress>("Address", addressSchema);
