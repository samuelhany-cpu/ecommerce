import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false });
        }

        const payload = await verifyToken(token);

        if (payload && payload.id) {
            return NextResponse.json({
                authenticated: true,
                user: {
                    id: payload.id,
                    email: payload.email,
                    role: payload.role
                }
            });
        }

        return NextResponse.json({ authenticated: false });
    } catch (error) {
        return NextResponse.json({ authenticated: false });
    }
}
