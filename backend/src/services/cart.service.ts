import mongoose from "mongoose";
import { CartModel, ICart } from "../models/cart.model";
import { ProductModel } from "../models/product.model";
import { HttpException } from "../exceptions/http-exception";

export class CartService {
    async get(userId: string): Promise<ICart> { return CartModel.findOneAndUpdate({ userId }, { $setOnInsert: { userId, items: [] } }, { new: true, upsert: true }); }
    async upsertItem(userId: string, productId: string, quantity: number): Promise<ICart> {
        if (!mongoose.isValidObjectId(productId)) {
            throw new HttpException(400, "Invalid product. Refresh the catalog and add the product again.");
        }
        const product = await ProductModel.findById(productId);
        if (!product) throw new HttpException(404, "Product not found");
        if (quantity > product.quantity) throw new HttpException(400, "Requested quantity exceeds available stock");
        const cart = await this.get(userId); const item = cart.items.find(i => i.productId.toString() === productId);
        if (item) item.quantity = quantity; else cart.items.push({ productId: new mongoose.Types.ObjectId(productId), quantity });
        return cart.save();
    }
    async removeItem(userId: string, productId: string): Promise<ICart> { const cart = await this.get(userId); cart.items = cart.items.filter(i => i.productId.toString() !== productId); return cart.save(); }
    async clear(userId: string): Promise<void> { await CartModel.updateOne({ userId }, { $set: { items: [] } }); }
}
