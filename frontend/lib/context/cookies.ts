import "server-only";

import { cookies } from "next/headers";

const TOKEN_COOKIE_NAME = "token";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

const defaultCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: THIRTY_DAYS_IN_SECONDS,
    path: "/"
};

export async function getCookie(name: string) {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value ?? null;
}

export async function setCookie(name: string, value: string) {
    const cookieStore = await cookies();
    cookieStore.set(name, value, defaultCookieOptions);
}

export async function deleteCookie(name: string) {
    const cookieStore = await cookies();
    cookieStore.delete(name);
}

export async function getTokenCookie() {
    return getCookie(TOKEN_COOKIE_NAME);
}

export async function setTokenCookie(token: string) {
    await setCookie(TOKEN_COOKIE_NAME, token);
}

export async function deleteTokenCookie() {
    await deleteCookie(TOKEN_COOKIE_NAME);
}
