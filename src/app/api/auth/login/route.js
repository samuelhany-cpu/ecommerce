import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        // Check if user exists
        const user = await User.findOne({ email });

        // For demo: create admin if not exists
        if (!user && email === 'samuelhany500@gmail.com') {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true // Primary admin is pre-verified
            });
            const token = await signToken({ id: newUser._id.toString(), role: newUser.role, email: newUser.email });

            const response = NextResponse.json({ success: true, user: { email: newUser.email, role: newUser.role } });
            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 86400,
                path: '/'
            });
            return response;
        }

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // Check verification status (Primary admin is exempt)
        if (!user.isVerified && user.email !== 'samuelhany500@gmail.com') {
            return NextResponse.json({
                success: false,
                error: 'Please verify your email address before logging in.',
                needsVerification: true,
                email: user.email
            }, { status: 403 });
        }

        const token = await signToken({ id: user._id.toString(), role: user.role, email: user.email });
        const response = NextResponse.json({ success: true, user: { email: user.email, role: user.role } });

        // Set Secure Cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400,
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
