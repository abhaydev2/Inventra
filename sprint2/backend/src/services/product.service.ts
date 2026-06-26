import { ProductMongoRepository } from "../repositories/product.repository";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { IProduct } from "../models/product.model";
import { HttpException } from "../exceptions/http-exception";

const productRepository = new ProductMongoRepository();

export class ProductService {
    async createProduct(productData: CreateProductDTO, userId: string): Promise<IProduct> {
        const existingSku = await productRepository.getProductBySku(productData.sku);
        if (existingSku) {
            throw new HttpException(400, "SKU already exists");
        }
        const product = await productRepository.createProduct({
            ...productData,
            createdBy: userId as any
        });
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
        return updated;
    }

    async deleteProduct(id: string): Promise<boolean> {
        const existing = await productRepository.getProductById(id);
        if (!existing) throw new HttpException(404, "Product not found");
        return await productRepository.delete(id);
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
