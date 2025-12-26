import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
}, {
    timestamps: true
});

// Unique index for userId and productId to prevent duplicate items
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
