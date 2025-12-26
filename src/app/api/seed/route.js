import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();

        // 1. Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});
        await OrderItem.deleteMany({});

        // 2. Seed Products
        const productsData = [
            {
                name: "Classic Cognac Messenger",
                description: "A vintage-inspired messenger bag crafted from full-grain organic leather. Features antiqued brass hardware and a spacious interior for a 15-inch laptop.",
                price: 249.99,
                category: "Men",
                images: ["/images/messenger.png"],
                stock: 12,
                sku: "CON-MSG-001",
                slug: "classic-cognac-messenger"
            },
            {
                name: "Minimalist Bifold Wallet",
                description: "Slim, durable, and elegant. This dark brown leather wallet ages gracefully, featuring 6 card slots and a currency sleeve.",
                price: 79.50,
                category: "Accessories",
                images: ["/images/wallet.png"],
                stock: 50,
                sku: "MIN-WL-002",
                slug: "minimalist-bifold-wallet"
            },
            {
                name: "Signature Tote Bag",
                description: "Our best-selling tote for everyday elegance. Spacious, sturdy, and sustainably tanned. Perfect for work or weekend getaways.",
                price: 320.00,
                category: "Women",
                images: ["/images/hero-bag.png"],
                stock: 8,
                sku: "SIG-TOTE-003",
                slug: "signature-tote-bag"
            }
        ];

        const products = await Product.insertMany(productsData);

        // 3. Seed Users
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            email: 'samuelhany500@gmail.com',
            password: adminPassword,
            role: 'admin',
            isVerified: true
        });

        const userPassword = await bcrypt.hash('user123', 10);
        const user = await User.create({
            email: 'john@example.com',
            password: userPassword,
            role: 'customer',
            isVerified: true
        });

        // 4. Seed Orders
        const order1 = await Order.create({
            userId: user._id,
            totalAmount: 329.49,
            status: 'delivered',
            paymentStatus: 'paid',
            paymentMethod: 'credit_card'
        });

        await OrderItem.create([
            {
                orderId: order1._id,
                productId: products[0]._id,
                quantity: 1,
                priceAtPurchase: products[0].price,
                productSnapshot: products[0].toObject()
            },
            {
                orderId: order1._id,
                productId: products[1]._id,
                quantity: 1,
                priceAtPurchase: products[1].price,
                productSnapshot: products[1].toObject()
            }
        ]);

        const order2 = await Order.create({
            userId: user._id,
            totalAmount: 320.00,
            status: 'processing',
            paymentStatus: 'paid',
            paymentMethod: 'paypal'
        });

        await OrderItem.create({
            orderId: order2._id,
            productId: products[2]._id,
            quantity: 1,
            priceAtPurchase: products[2].price,
            productSnapshot: products[2].toObject()
        });

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            counts: { products: products.length, users: 2, orders: 2 }
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
