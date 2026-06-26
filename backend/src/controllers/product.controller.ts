import { ProductService } from "../services/product.service";
import { z } from "zod";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
import { IUser } from "../models/user.model";

const productService = new ProductService();

export class ProductController {
    async createProduct(req: Request, res: Response) {
        try {
            const parsed = CreateProductDTO.safeParse(req.body);
            if (!parsed.success) {
              return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = (req.user as IUser)._id.toString();
            const product = await productService.createProduct(parsed.data, userId);
            return ApiResponseHelper.success(res, product, "Product created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getProduct(req: Request, res: Response) {
        try {
            const product = await productService.getProduct(req.params.id as string);
            return ApiResponseHelper.success(res, product, "Product fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getAllProducts(req: Request, res: Response) {
        try {
            const filters = {
                category: req.query.category as string | undefined,
                search: req.query.search as string | undefined
            };
            const products = await productService.getAllProducts(filters);
            return ApiResponseHelper.success(res, products, "Products fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const parsed = UpdateProductDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const product = await productService.updateProduct(req.params.id as string, parsed.data);
            return ApiResponseHelper.success(res, product, "Product updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            await productService.deleteProduct(req.params.id as string);
            return ApiResponseHelper.success(res, null, "Product deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getLowStockProducts(req: Request, res: Response) {
        try {
            const products = await productService.getLowStockProducts();
            return ApiResponseHelper.success(res, products, "Low stock products fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getDashboardStats(req: Request, res: Response) {
        try {
            const stats = await productService.getDashboardStats();
            return ApiResponseHelper.success(res, stats, "Dashboard stats fetched");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
