import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const code = body.code;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required.' },
        { status: 400 }
      );
    }

    // Get latest OTP (code is select:false → must explicitly select)
    const otpRecord = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .select('+code');

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    // Expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteMany({ email });
      return NextResponse.json(
        { success: false, error: 'Verification code expired.' },
        { status: 400 }
      );
    }

    // Rate limit attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteMany({ email });
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    const codeHash = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    if (otpRecord.code !== codeHash) {
      otpRecord.attempts += 1;
      otpRecord.lastAttemptAt = new Date();
      await otpRecord.save();

      return NextResponse.json(
        { success: false, error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    // ✅ Mark user verified
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    user.isVerified = true;
    await user.save();

    // Remove OTPs
    await OTP.deleteMany({ email });

    return NextResponse.json(
      { success: true, message: 'Email verified successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
