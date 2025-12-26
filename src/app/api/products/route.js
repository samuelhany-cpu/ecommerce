import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const adminMode = searchParams.get('admin') === 'true';

        // Basic filtering
        const query = adminMode ? {} : { isActive: true };

        // Category filtering
        const category = searchParams.get('category');
        if (category) query.category = category;

        // Search
        const search = searchParams.get('search');
        if (search) {
            query.$text = { $search: search };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
        }

        const body = await req.json();

        // Auto-generate slug if not provided
        if (!body.slug && body.name) {
            body.slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        }

        // Auto-generate SKU if not provided
        if (!body.sku && body.name) {
            body.sku = `LL-${body.name.replace(/\s+/g, '-').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const product = await Product.create(body);
        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...data } = body;

        const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
