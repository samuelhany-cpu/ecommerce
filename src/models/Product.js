import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Women', 'Men', 'Accessories'] },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in development
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
