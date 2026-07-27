import mongoose, { Schema, Document } from "mongoose";
import { ProductType } from "../types/product.type";

export interface IProduct extends ProductType, Document {
    _id: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProductMongoSchema: Schema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 0, default: 0 },
        category: { type: String, required: true },
        sku: { type: String, required: true, unique: true },
        lowStockThreshold: { type: Number, default: 10 },
        image: { type: String, default: "" },
        salesCount: { type: Number, default: 0, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
    },
    {
        timestamps: true
    }
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductMongoSchema);
