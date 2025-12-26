import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import OrderItem from '@/models/OrderItem';
import Address from '@/models/Address';
import Cart from '@/models/Cart';
import { sendOrderEmail } from '@/lib/email';
import { verifyToken } from '@/lib/auth';
import { validateProducts } from '@/lib/validation';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await Order.find({})
            .populate('userId', 'email firstName lastName')
            .populate('shippingAddressId')
            .sort({ createdAt: -1 });

        // Fetch order items separately or use virtual if defined
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem.find({ orderId: order._id });
            return { ...order.toObject(), orderItems: items };
        }));

        return NextResponse.json({ success: true, data: ordersWithItems });
    } catch (error) {
        console.error('Fetch Orders error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    let session = null;
    let usingTransactions = false;
    try {
        await dbConnect();
        // Detect whether the connected deployment supports transactions (replica set or mongos)
        try {
            const admin = mongoose.connection.db.admin();
            // Use hello or ismaster depending on server version
            let info = null;
            try {
                info = await admin.command({ hello: 1 });
            } catch (e) {
                try { info = await admin.command({ ismaster: 1 }); } catch (e2) { info = null; }
            }

            const isReplicaSet = info && (info.setName || info.msg === 'isdbgrid');
            console.info('Mongo deployment info (hello/ismaster):', info, ' => replicaSetSupport=', Boolean(isReplicaSet));
            if (isReplicaSet) {
                session = await mongoose.startSession();
                session.startTransaction();
                usingTransactions = true;
            } else {
                usingTransactions = false;
                if (session) { try { session.endSession(); } catch (e) {} }
            }
        } catch (txErr) {
            console.warn('Transactions detection/start failed, proceeding without transaction:', txErr.message);
            if (session) { try { session.endSession(); } catch (e) {} }
            session = null;
            usingTransactions = false;
        }

        const token = req.cookies.get('token')?.value;
        if (!token) throw new Error('Authentication required');

        const payload = await verifyToken(token);
        if (!payload || !payload.id) throw new Error('Invalid authentication');

        const userId = payload.id;
        const body = await req.json();
        const { items, total, addressId, paymentMethod } = body;

        // 1. Validate Products & Stock
        const validation = await validateProducts(items);
        if (!validation.valid) {
            if (usingTransactions && session) {
                await session.abortTransaction();
                session.endSession();
            }
            return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
        }

        // 2. Ensure Address exists
        const address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            if (usingTransactions && session) {
                await session.abortTransaction();
                session.endSession();
            }
            return NextResponse.json({ success: false, error: 'Invalid address' }, { status: 400 });
        }

        // 3. Create Order
        const opts = usingTransactions && session ? { session } : {};

        let order;
        try {
            const res = await Order.create([{
                userId,
                totalAmount: total,
                shippingAddressId: addressId,
                billingAddressId: addressId, // Default to same for now
                paymentMethod: paymentMethod || 'cash_on_delivery',
                paymentStatus: 'pending',
                status: 'pending'
            }], opts);
            order = res[0];
        } catch (createErr) {
            // If the error indicates transactions aren't allowed, retry without session
            if (createErr && (createErr.code === 20 || /Transaction numbers are only allowed/i.test(String(createErr.message || '')))) {
                console.warn('Order.create failed with transaction error, retrying without session:', createErr.message);
                // cleanup session if we thought we were using it
                if (usingTransactions && session) {
                    try { await session.abortTransaction(); } catch (e) {}
                    try { session.endSession(); } catch (e) {}
                }
                usingTransactions = false;
                session = null;
                // retry without opts
                const res = await Order.create([{
                    userId,
                    totalAmount: total,
                    shippingAddressId: addressId,
                    billingAddressId: addressId,
                    paymentMethod: paymentMethod || 'cash_on_delivery',
                    paymentStatus: 'pending',
                    status: 'pending'
                }], {});
                order = res[0];
            } else {
                throw createErr;
            }
        }

        // 4. Create OrderItems
        const orderItemsData = items.map(item => ({
            orderId: order._id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: validation.snapshots[item.productId].price,
            productSnapshot: validation.snapshots[item.productId]
        }));

        try {
            await OrderItem.insertMany(orderItemsData, opts);
        } catch (oiErr) {
            if (oiErr && (oiErr.code === 20 || /Transaction numbers are only allowed/i.test(String(oiErr.message || '')))) {
                console.warn('OrderItem.insertMany failed with transaction error, retrying without session:', oiErr.message);
                usingTransactions = false;
                session = null;
                await OrderItem.insertMany(orderItemsData, {});
            } else {
                throw oiErr;
            }
        }

        // 5. Clear Cart
        try {
            await Cart.deleteMany({ userId }, opts);
        } catch (cartErr) {
            if (cartErr && (cartErr.code === 20 || /Transaction numbers are only allowed/i.test(String(cartErr.message || '')))) {
                console.warn('Cart.deleteMany failed with transaction error, retrying without session:', cartErr.message);
                usingTransactions = false;
                session = null;
                await Cart.deleteMany({ userId }, {});
            } else {
                throw cartErr;
            }
        }

        if (usingTransactions && session) {
            await session.commitTransaction();
            session.endSession();
        }

        // Build a minimal order payload for the email containing item names/prices
        const productIds = orderItemsData.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds } }).select('name price').lean();
        const productMap = {};
        products.forEach(p => { productMap[String(p._id)] = p; });

        const itemsForEmail = orderItemsData.map(i => {
            const p = productMap[String(i.productId)];
            return {
                productId: i.productId,
                name: p ? p.name : (i.productSnapshot?.name || 'Product'),
                price: i.priceAtPurchase || (p ? p.price : 0),
                quantity: i.quantity
            };
        });

        const user = await User.findById(userId);
        await sendOrderEmail(user.email, { id: order._id, items: itemsForEmail, totalAmount: total });

        return NextResponse.json({ success: true, orderId: order._id }, { status: 201 });

    } catch (error) {
        if (usingTransactions && session) {
            try { await session.abortTransaction(); } catch (e) {}
            try { session.endSession(); } catch (e) {}
        }
        console.error('Order POST Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
