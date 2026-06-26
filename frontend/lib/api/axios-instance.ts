const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api/v1";

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    let token = null;
    if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
    } else {
        try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            token = cookieStore.get("token")?.value || null;
        } catch (e) {
            // Ignore error if not run in a request context
        }
    }

    const headers: HeadersInit = {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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
