import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem { productId: mongoose.Types.ObjectId; quantity: number; }
export interface ICart extends Document { userId: mongoose.Types.ObjectId; items: ICartItem[]; createdAt: Date; updatedAt: Date; }

const cartSchema = new Schema<ICart>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: [{ productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, quantity: { type: Number, required: true, min: 1 } }]
}, { timestamps: true });

export const CartModel = mongoose.model<ICart>("Cart", cartSchema);
