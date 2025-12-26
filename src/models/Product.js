import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0.01 },
    category: {
        type: String,
        required: true,
        enum: ['Women', 'Men', 'Accessories'],
        index: true
    },
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'A product must have at least one image.'
        }
    },
    stock: { type: Number, required: true, default: 0, min: 0 },

    // Operational & Inventory
    sku: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true, index: true },

    // Physical Specs
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: 'cm' }
    },
    weight: { type: Number }, // in grams

    // Product Details
    materials: [{ type: String }],
    careInstructions: { type: String },
    colors: [{ type: String }],

    // Marketing & Discovery
    featured: { type: Boolean, default: false },
    tags: { type: [String], index: true },

    // Analytics
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },

    reviews: [{
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        photo: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now, index: -1 },
}, {
    timestamps: true
});

// Compound Index for filtered catalog browsing
ProductSchema.index({ isActive: 1, category: 1 });

// Text Index for internal search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' }, {
    weights: {
        name: 10,
        tags: 5,
        description: 2
    }
});

// Prevent model overwrite in development
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
