import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 999,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },

    // ✅ keep same field name, but validate structure better
    productSnapshot: {
      name: { type: String, required: true, trim: true, maxlength: 200 },
      sku: { type: String, required: true, trim: true, maxlength: 80 },
      image: { type: String, required: true, trim: true, maxlength: 500 },
      category: { type: String, trim: true, maxlength: 80, default: '' },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

OrderItemSchema.index({ orderId: 1, createdAt: 1 });

export default mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
