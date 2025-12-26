import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Get orders for the authenticated user
        const orders = await Order.find({ userId: payload.id }).sort({ createdAt: -1 });

        // Attach order items for each order for frontend convenience
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await import('@/models/OrderItem').then(m => m.default).then(OrderItem => OrderItem.find({ orderId: order._id }).lean());
            return { ...order.toObject({ virtuals: true }), items };
        }));

        return NextResponse.json({ success: true, data: ordersWithItems });
    } catch (error) {
        console.error('My Orders Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
