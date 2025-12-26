import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
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
        min: 1
    },
    priceAtPurchase: {
        type: Number,
        required: true
    },
    productSnapshot: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
