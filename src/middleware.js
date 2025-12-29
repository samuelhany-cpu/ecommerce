import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Edge-safe JWT secret
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'complex_secret_key_change_this_in_prod'
);

/**
 * Verify JWT in Edge runtime
 */
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload; // { userId, role, ... }
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  /**
   * 0️⃣ HARD KILL SWITCH
   * Allow running the app with NO authentication at all
   * .env.local → DISABLE_AUTH=true
   */
  if (process.env.DISABLE_AUTH === 'true') {
    return NextResponse.next();
  }

  /**
   * 1️⃣ Skip Next.js internals & static assets
   */
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  /**
   * 2️⃣ Allow public routes
   */
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  /**
   * 3️⃣ Protect /admin only
   */
  const isAdminRoute =
    pathname === '/admin' || pathname.startsWith('/admin/');

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  /**
   * 4️⃣ Read JWT cookie
   * Cookie must be:
   * httpOnly, secure (prod), sameSite=lax
   */
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  /**
   * 5️⃣ Verify JWT
   */
  const payload = await verifyToken(token);

  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  /**
   * 6️⃣ Optional role enforcement (recommended for production)
   * Enable this once roles are fully enforced everywhere
   */
  // if (payload.role !== 'admin') {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/';
  //   return NextResponse.redirect(url);
  // }

  /**
   * 7️⃣ All checks passed
   */
  return NextResponse.next();
}

/**
 * Apply middleware to all routes
 */
export const config = {
  matcher: ['/:path*'],
};
