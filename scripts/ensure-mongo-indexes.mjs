import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config({ path: '.env.local' });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const ProductModel = Product.default || Product;
        const products = await ProductModel.find({
            $or: [
                { sku: { $exists: false } },
                { slug: { $exists: false } }
            ]
        });

        console.log(`Found ${products.length} products needing updates...`);

        for (const p of products) {
            if (!p.sku) {
                p.sku = `LL-${p.name.replace(/\s+/g, '-').toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
            }
            if (!p.slug) {
                p.slug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            }
            await p.save();
            console.log(`Updated Product: ${p.name}`);
        }

        // Force index creation
        console.log('Ensuring indexes...');
        await ProductModel.createIndexes();
        console.log('MongoDB schema enhancement and indexing completed!');

    } catch (error) {
        console.error('MongoDB migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
