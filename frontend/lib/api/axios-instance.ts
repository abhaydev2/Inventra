const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api/v1";

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}
