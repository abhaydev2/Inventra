import { apiRequest } from "./axios-instance";
import { API_ENDPOINTS } from "./endpoints";

export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    category: string;
    sku: string;
    lowStockThreshold: number;
    createdBy: any;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductPayload {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    category: string;
    sku: string;
    lowStockThreshold?: number;
}

export async function getAllProducts(filters?: { category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ data: Product[] }>(`${API_ENDPOINTS.products.base}${query}`);
}

export async function getProduct(id: string) {
    return apiRequest<{ data: Product }>(API_ENDPOINTS.products.byId(id));
}

export async function createProduct(payload: CreateProductPayload) {
    return apiRequest<{ data: Product }>(API_ENDPOINTS.products.base, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export async function updateProduct(id: string, payload: Partial<CreateProductPayload>) {
    return apiRequest<{ data: Product }>(API_ENDPOINTS.products.byId(id), {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

export async function deleteProduct(id: string) {
    return apiRequest(API_ENDPOINTS.products.byId(id), { method: "DELETE" });
}

export async function uploadProductImage(id: string, image: File) {
    const formData = new FormData();
    formData.append("productImage", image);
    return apiRequest<{ data: Product }>(`${API_ENDPOINTS.products.byId(id)}/image`, { method: "POST", body: formData });
}

export async function getDashboardStats() {
    return apiRequest<{ data: { totalProducts: number; totalStock: number; lowStockItems: number; totalInventoryValue: number } }>(
        API_ENDPOINTS.products.dashboard
    );
}

export async function getLowStockProducts() {
    return apiRequest<{ data: Product[] }>(API_ENDPOINTS.products.lowStock);
}
