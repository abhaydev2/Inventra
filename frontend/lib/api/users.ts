import { apiRequest } from "./axios-instance";
import { API_ENDPOINTS } from "./endpoints";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: "admin" | "user";
    profileImage?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password?: string;
    role: "admin" | "user";
}

export interface PaginatedUsersResponse {
    success: boolean;
    message: string;
    data: User[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function getAdminUsers(page: number, limit: number, search?: string) {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search) params.append("search", search);
    return apiRequest<PaginatedUsersResponse>(`${API_ENDPOINTS.admin.users}?${params.toString()}`);
}

export async function getAdminUserById(id: string) {
    return apiRequest<{ success: boolean; data: User }>(API_ENDPOINTS.admin.userById(id));
}

export async function createAdminUser(payload: CreateUserPayload) {
    return apiRequest<{ success: boolean; data: User }>(API_ENDPOINTS.admin.users, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export async function updateAdminUser(id: string, payload: Partial<CreateUserPayload>) {
    return apiRequest<{ success: boolean; data: User }>(API_ENDPOINTS.admin.userById(id), {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

export async function deleteAdminUser(id: string) {
    return apiRequest<{ success: boolean; message: string }>(API_ENDPOINTS.admin.userById(id), { method: "DELETE" });
}
