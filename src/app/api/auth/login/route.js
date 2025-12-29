import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Simple validation helpers (بدون مكتبات إضافية)
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const emailRaw = body?.email;
    const password = body?.password;

    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';

    // ✅ Input validation
    if (!isValidEmail(email) || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    // ✅ If your User model sets password select:false
    const user = await User.findOne({ email }).select('+password');

    // ✅ Don’t reveal whether user exists
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // ✅ Verify status (if you want to enforce email verification)
    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email address before logging in.',
          needsVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // ✅ Token payload: keep minimal (id + role)
    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, role: user.role },
    });

    // ✅ Cookie best-practice
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
