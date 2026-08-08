export const API_ENDPOINTS = {
    auth: {
        register: "/auth/register",
        login: "/auth/login",
        forgotPassword: "/auth/forgot-password",
        verifyResetCode: "/auth/verify-reset-code",
        resetPassword: "/auth/reset-password",
        profile: "/auth/profile",
        whoami: "/auth/whoami",
        update: "/auth/update"
    },
    products: {
        base: "/products",
        byId: (id: string) => `/products/${id}`,
        lowStock: "/products/low-stock",
        dashboard: "/products/dashboard"
    },
    admin: {
        users: "/admin/users",
        userById: (id: string) => `/admin/users/${id}`
    }
};
