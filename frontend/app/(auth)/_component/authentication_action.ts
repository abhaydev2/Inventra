"use server";

import { cookies } from "next/headers";
import { registerUser, loginUser, updateProfile } from "@/lib/api/auth";
import { revalidatePath } from "next/cache";

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

        return { ok: true, user, token };
    } catch (error: any) {
        return { ok: false, error: error.message || "Login failed" };
    }
}

export async function registerAction(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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

export async function updateProfileAction(payload: FormData | any) {
    try {
        const response = await updateProfile(payload);
        revalidatePath("/admin", "layout");
        revalidatePath("/user", "layout");
        return { ok: true, data: response.data };
    } catch (error: any) {
        return { ok: false, error: error.message || "Update failed" };
    }
}
