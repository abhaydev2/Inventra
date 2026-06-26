import { ProductModel, IProduct } from "../models/product.model";

export interface IProductRepository {
    createProduct(product: Partial<IProduct>): Promise<IProduct>;
    getProductById(id: string): Promise<IProduct | null>;
    getProductBySku(sku: string): Promise<IProduct | null>;
    getAll(filters?: Record<string, any>): Promise<IProduct[]>;
    update(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string): Promise<boolean>;
    getLowStockProducts(): Promise<IProduct[]>;
}

export class ProductMongoRepository implements IProductRepository {
    async createProduct(product: Partial<IProduct>): Promise<IProduct> {
        return await ProductModel.create(product);
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return await ProductModel.findById(id).populate("createdBy", "firstName lastName email");
    }

    async getProductBySku(sku: string): Promise<IProduct | null> {
        return await ProductModel.findOne({ sku });
    }

    async getAll(filters?: Record<string, any>): Promise<IProduct[]> {
        const query: Record<string, any> = {};
        if (filters?.category) query.category = filters.category;
        if (filters?.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { sku: { $regex: filters.search, $options: "i" } }
            ];
        }
        return await ProductModel.find(query).populate("createdBy", "firstName lastName email");
    }

    async update(id: string, product: Partial<IProduct>): Promise<IProduct | null> {
        return await ProductModel.findByIdAndUpdate(id, product, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await ProductModel.findByIdAndDelete(id);
        return !!deleted;
    }

    async getLowStockProducts(): Promise<IProduct[]> {
        return await ProductModel.find({
            $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
        });
    }
}
