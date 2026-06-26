import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getJwtPayload(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/user');
    const isPublicRoute = pathname === '/login' || pathname === '/register';

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token) {
        const payload = getJwtPayload(token);
        if (payload) {
            const role = payload.role; // "admin" or "user"
            
            if (pathname.startsWith('/admin') && role !== 'admin') {
                return NextResponse.redirect(new URL('/user', request.url));
            }

            if (pathname.startsWith('/user') && role !== 'user') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/user/:path*', '/login', '/register'],
};
export default proxy;
