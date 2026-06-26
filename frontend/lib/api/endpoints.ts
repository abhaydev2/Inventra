export const API_ENDPOINTS = {
    auth: {
        register: "/auth/register",
        login: "/auth/login",
        profile: "/auth/profile",
        whoami: "/auth/whoami",
        update: "/auth/update"
    },
    products: {
        base: "/products",
        byId: (id: string) => `/products/${id}`,
        lowStock: "/products/low-stock",
        dashboard: "/products/dashboard"
    }
};
