import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, data: [] }); // Return empty for guests

        const payload = await verifyToken(token);
        if (!payload || !payload.id) return NextResponse.json({ success: false, data: [] });

        const cartItems = await Cart.find({ userId: payload.id });

        return NextResponse.json({ success: true, data: cartItems });
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
        const { productId, quantity, action } = body; // action: 'set', 'add', 'remove'

        if (action === 'remove') {
            await Cart.deleteOne({ userId: payload.id, productId });
            return NextResponse.json({ success: true, message: 'Removed from cart' });
        }

        if (action === 'set') {
            if (quantity <= 0) {
                await Cart.deleteOne({ userId: payload.id, productId });
            } else {
                await Cart.findOneAndUpdate(
                    { userId: payload.id, productId },
                    { quantity },
                    { upsert: true, new: true }
                );
            }
        } else {
            // Default: 'add' or increment
            await Cart.findOneAndUpdate(
                { userId: payload.id, productId },
                { $inc: { quantity: quantity || 1 } },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ success: true, message: 'Cart updated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Clear cart
export async function DELETE(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.id) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        await Cart.deleteMany({ userId: payload.id });

        return NextResponse.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
