import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await req.json();
        const { user, rating, comment, photo } = body;

        if (!user || !rating || !comment) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        product.reviews.push({ user, rating, comment, photo });
        await product.save();

        return NextResponse.json({ success: true, data: product.reviews });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
