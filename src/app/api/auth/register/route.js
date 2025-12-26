import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { sendOTPEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return NextResponse.json({ success: false, error: 'Email already registered and verified' }, { status: 400 });
            }
            // If exists but not verified, we'll just send a new OTP
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create or update user as unverified
        let user;
        if (existingUser) {
            user = existingUser;
            user.password = hashedPassword;
            await user.save();
        } else {
            user = await User.create({
                email,
                password: hashedPassword,
                role: 'customer',
                isVerified: false
            });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Delete old OTPs for this email
        await OTP.deleteMany({ email });

        // Save new OTP
        await OTP.create({
            email,
            code: otpCode,
            expiresAt
        });

        // Send OTP Email
        await sendOTPEmail(email, otpCode);

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully. Please verify your email.',
            email: user.email
        }, { status: 201 });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
