import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { sendOTPEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const password = body.password;

    // ✅ Validation
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email already registered.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.password = hashedPassword;
      user.isVerified = false;
      await user.save();
    } else {
      user = await User.create({
        email,
        password: hashedPassword,
        role: 'customer',
        isVerified: false,
      });
    }

    // ✅ Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto
      .createHash('sha256')
      .update(otpCode)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Remove old OTPs
    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      userId: user._id,
      code: otpHash, // ✅ HASHED
      expiresAt,
      attempts: 0,
    });

    await sendOTPEmail(email, otpCode);

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your email.',
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
