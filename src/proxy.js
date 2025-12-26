import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getIP, getGeoLocation } from '@/lib/logger';

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // Skip static assets and internal requests
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/audit') || // Avoid infinite loop
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Get IP and Location
    const ip = getIP(request);
    const location = getGeoLocation(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Attempt to get user ID from token if it exists
    const token = request.cookies.get('token')?.value;
    let userId = null;
    if (token) {
        const decoded = await verifyToken(token);
        if (decoded) {
            userId = decoded.userId;
        }
    }

    // Log the visit/action
    // We call the API route for logging because middleware runs in Edge Runtime
    // and might have issues connecting directly to Mongoose (which requires Node.js)
    // However, if we want "everything" logged, we can fire and forget a log request.

    // Using a background fetch to log so we don't block the request
    // We'll create a dedicated logging endpoint for this.
    try {
        fetch(`${request.nextUrl.origin}/api/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                action: `Visit: ${pathname}`,
                endpoint: pathname,
                method: request.method,
                ip,
                location,
                userAgent,
            }),
        }).catch(err => console.error('Middleware Logging Fetch Error:', err));
    } catch (e) {
        console.error('Middleware Logging Error:', e);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (internal api calls except the ones we want to log)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
