import { ProductMongoRepository } from "../repositories/product.repository";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { IProduct } from "../models/product.model";
import { HttpException } from "../exceptions/http-exception";
import { NotificationService } from "./notification.service";

const productRepository = new ProductMongoRepository();

export class ProductService {
    private notificationService = new NotificationService();
    async createProduct(productData: CreateProductDTO, userId: string): Promise<IProduct> {
        const existingSku = await productRepository.getProductBySku(productData.sku);
        if (existingSku) {
            throw new HttpException(400, "SKU already exists");
        }
        const product = await productRepository.createProduct({
            ...productData,
            createdBy: userId as any
        });
        await this.notificationService.create({ audience: "user", type: "inventory", title: "New inventory available", message: `${product.name} is now available in the catalog.`, metadata: { productId: product._id.toString() } });
        return product;
    }

    async getProduct(id: string): Promise<IProduct> {
        const product = await productRepository.getProductById(id);
        if (!product) throw new HttpException(404, "Product not found");
        return product;
    }

    async getAllProducts(filters?: Record<string, any>): Promise<IProduct[]> {
        return await productRepository.getAll(filters);
    }

    async updateProduct(id: string, productData: UpdateProductDTO): Promise<IProduct> {
        const existing = await productRepository.getProductById(id);
        if (!existing) throw new HttpException(404, "Product not found");

        if (productData.sku && productData.sku !== existing.sku) {
            const skuTaken = await productRepository.getProductBySku(productData.sku);
            if (skuTaken) throw new HttpException(400, "SKU already in use");
        }

        const updated = await productRepository.update(id, productData);
        if (!updated) throw new HttpException(500, "Failed to update product");
        await this.notificationService.create({ audience: "user", type: "inventory", title: "Inventory updated", message: `${updated.name} has been updated by the inventory administrator.`, metadata: { productId: updated._id.toString() } });
        if (updated.quantity === 0) await this.notificationService.create({ audience: "admin", type: "inventory", title: "Out of stock", message: `${updated.name} is out of stock and needs replenishment.`, metadata: { productId: updated._id.toString() } });
        return updated;
    }

    async updateProductImage(id: string, image: string): Promise<IProduct> {
        const product = await productRepository.getProductById(id);
        if (!product) throw new HttpException(404, "Product not found");
        const updated = await productRepository.update(id, { image });
        if (!updated) throw new HttpException(500, "Failed to update product image");
        return updated;
    }

    async deleteProduct(id: string): Promise<boolean> {
        const existing = await productRepository.getProductById(id);
        if (!existing) throw new HttpException(404, "Product not found");
        const removed = await productRepository.delete(id);
        if (removed) await this.notificationService.create({ audience: "user", type: "inventory", title: "Product removed", message: `${existing.name} is no longer available in the catalog.` });
        return removed;
    }

    async getLowStockProducts(): Promise<IProduct[]> {
        return await productRepository.getLowStockProducts();
    }

    async getDashboardStats() {
        const allProducts = await productRepository.getAll();
        const lowStock = await productRepository.getLowStockProducts();
        const totalQuantity = allProducts.reduce((sum, p) => sum + p.quantity, 0);
        const totalValue = allProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

        return {
            totalProducts: allProducts.length,
            totalStock: totalQuantity,
            lowStockItems: lowStock.length,
            totalInventoryValue: totalValue
        };
    }
}
