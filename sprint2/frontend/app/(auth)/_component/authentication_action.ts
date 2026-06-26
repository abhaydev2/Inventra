"use server";

import { cookies } from "next/headers";
import { registerUser, loginUser } from "@/lib/api/auth";

export async function loginAction(email: string, password: string) {
    try {
        const response: any = await loginUser({ email, password });
        const { user, token } = response.data;

        // Store JWT in httpOnly cookie (secure, not accessible from JS)
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/"
        });

        return { ok: true, user };
    } catch (error: any) {
        return { ok: false, error: error.message || "Login failed" };
    }
}

export async function registerAction(payload: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}) {
    try {
        await registerUser(payload);
        return { ok: true };
    } catch (error: any) {
        return { ok: false, error: error.message || "Registration failed" };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return { ok: true };
}
