import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      default: 1,
      min: 1,
      max: 999,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Prevent duplicate items per user
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Helpful for "recently updated cart"
CartSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
