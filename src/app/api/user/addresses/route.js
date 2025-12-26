import dbConnect from '@/lib/mongodb';
import Address from '@/models/Address';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const addresses = await Address.find({ userId: payload.id })
            .sort({ isDefault: -1, createdAt: -1 });

        return NextResponse.json({ success: true, data: addresses });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { fullName, phone, street, city, state, zipCode, country, isDefault, type } = body;

        // If setting as default, unset others for this user/type
        if (isDefault) {
            await Address.updateMany(
                { userId: payload.id, type: type || 'shipping' },
                { isDefault: false }
            );
        }

        const address = await Address.create({
            userId: payload.id,
            fullName,
            phone,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false,
            type: type || 'shipping'
        });

        return NextResponse.json({ success: true, data: address }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
