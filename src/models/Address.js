import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['shipping', 'billing'],
      default: 'shipping',
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Faster fetching for user's addresses
AddressSchema.index({ userId: 1, type: 1, createdAt: -1 });

// ✅ Ensure ONLY ONE default address per user + type
AddressSchema.index(
  { userId: 1, type: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);
