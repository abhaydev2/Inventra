import { apiRequest } from "./axios-instance";
import { API_ENDPOINTS } from "./endpoints";

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export async function registerUser(payload: RegisterPayload) {
    return apiRequest(API_ENDPOINTS.auth.register, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export async function loginUser(payload: LoginPayload) {
    return apiRequest<{ data: { user: any; token: string } }>(
        API_ENDPOINTS.auth.login,
        {
            method: "POST",
            body: JSON.stringify(payload)
        }
    );
}

export async function getProfile() {
    return apiRequest(API_ENDPOINTS.auth.profile);
}
