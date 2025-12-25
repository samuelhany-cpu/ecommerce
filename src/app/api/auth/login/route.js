import sequelize from '@/lib/mysql';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Initialize DB sync (in production this should be a migration script)
// const syncDb = async () => { await sequelize.sync(); };
// syncDb();

export async function POST(req) {
    try {
        // Ensure tables exist - strictly for dev/demo purposes
        await sequelize.sync();

        const { email, password } = await req.json();

        // Check if user exists
        const user = await User.findOne({ where: { email } });

        // For demo: create admin if not exists
        if (!user && email === 'admin@luxeleather.com') {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({ email, password: hashedPassword, role: 'admin' });
            const token = signToken({ id: newUser.id, role: newUser.role });

            const response = NextResponse.json({ success: true, user: { email: newUser.email, role: newUser.role } });
            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400
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

        const token = signToken({ id: user.id, role: user.role });
        const response = NextResponse.json({ success: true, user: { email: user.email, role: user.role } });

        // Set Secure Cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
