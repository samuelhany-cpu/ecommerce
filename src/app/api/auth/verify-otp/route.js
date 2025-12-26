import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ success: false, error: 'Email and code required' }, { status: 400 });
        }

        // Find the most recent OTP for this email
        const otpRecord = await OTP.findOne({ email, code }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
        }

        // Check expiration
        if (new Date() > otpRecord.expiresAt) {
            return NextResponse.json({ success: false, error: 'Verification code has expired' }, { status: 400 });
        }

        // Mark user as verified
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        user.isVerified = true;
        await user.save();

        // Delete the used OTP
        await OTP.deleteMany({ email });

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully. You can now login.'
        }, { status: 200 });

    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
