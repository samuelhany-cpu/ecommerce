import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const payload = verifyToken(token);
            if (!payload || payload.role !== 'admin') {
                // Redirect to home if logged in but not admin
                return NextResponse.redirect(new URL('/', req.url));
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // Optional: Redirect /login if already authenticated
    if (pathname.startsWith('/login') && token) {
        const payload = verifyToken(token);
        if (payload) {
            return NextResponse.redirect(new URL(payload.role === 'admin' ? '/admin' : '/', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
