import { z } from "zod";

export const ProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be non-negative"),
    quantity: z.number().int().min(0, "Quantity must be non-negative"),
    category: z.string().min(1, "Category is required"),
    sku: z.string().min(1, "SKU is required"),
    lowStockThreshold: z.number().int().min(0).default(10)
});

export type ProductType = z.infer<typeof ProductSchema>;
