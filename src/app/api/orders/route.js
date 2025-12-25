import sequelize from '@/lib/mysql';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendOrderEmail } from '@/lib/email';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const token = req.cookies.get('token')?.value;
        let userId = null;
        let email = null;

        if (token) {
            const payload = verifyToken(token);
            if (payload) userId = payload.id;
        }

        const body = await req.json();
        const { items, total, guestEmail } = body;

        // If guest, create temporary user or handle guest checkout (simplifying to require email)
        if (!userId && guestEmail) {
            // Check if user exists or create guest user
            // For now, just using guest email for notification
            email = guestEmail;
            // In real app, we'd ensure a User record exists or Order allows null userId (if decided)
            // Our Order model requires userId. Let's find or create a user.
            let user = await User.findOne({ where: { email: guestEmail } });
            if (!user) {
                // Create dummy user for guest
                user = await User.create({ email: guestEmail, password: 'guest_checkout_password' });
            }
            userId = user.id;
        } else if (userId) {
            const user = await User.findByPk(userId);
            email = user.email;
        } else {
            return NextResponse.json({ success: false, error: 'Authentication or Guest Email required' }, { status: 401 });
        }

        await sequelize.sync(); // Ensure tables

        const order = await Order.create({
            userId,
            totalAmount: total,
            items: items, // Sequelize handles JSON stringification if dialect supports it, or we pass object if defined as JSON
            status: 'pending'
        });

        // Send Emails
        await sendOrderEmail(order, email);

        return NextResponse.json({ success: true, order }, { status: 201 });

    } catch (error) {
        console.error('Order Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
