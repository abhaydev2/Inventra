import { apiRequest } from "./axios-instance";
import { API_ENDPOINTS } from "./endpoints";

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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

export async function requestPasswordReset(email: string) {
    return apiRequest<{ data: { message: string; delivery: "email" }; message: string }>(
        API_ENDPOINTS.auth.forgotPassword,
        {
            method: "POST",
            body: JSON.stringify({ email })
        }
    );
}

export async function verifyPasswordResetCode(email: string, code: string) {
    return apiRequest<{ data: { resetToken: string }; message: string }>(
        API_ENDPOINTS.auth.verifyResetCode,
        {
            method: "POST",
            body: JSON.stringify({ email, code })
        }
    );
}

export async function resetPassword(token: string, password: string) {
    return apiRequest<{ data: unknown; message: string }>(
        API_ENDPOINTS.auth.resetPassword,
        {
            method: "POST",
            body: JSON.stringify({ token, password })
        }
    );
}

export async function getProfile() {
    return apiRequest(API_ENDPOINTS.auth.profile);
}

export async function whoami() {
    return apiRequest<{ data: any }>(API_ENDPOINTS.auth.whoami);
}

export async function updateProfile(payload: FormData | any) {
    return apiRequest<{ data: any }>(API_ENDPOINTS.auth.update, {
        method: "PUT",
        body: payload instanceof FormData ? payload : JSON.stringify(payload)
    });
}
