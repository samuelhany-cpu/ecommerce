import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: '',
      maxlength: 50,
    },
    transactionId: {
      type: String,
      trim: true,
      default: '',
      index: true,
      maxlength: 120,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Virtual: fetch items related to this order
OrderSchema.virtual('orderItems', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'orderId',
});

// ✅ IMPORTANT: include virtuals in output
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

// ✅ Indexes for dashboards & user order history
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
