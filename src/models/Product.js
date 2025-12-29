import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '', maxlength: 2000 },
  },
  { timestamps: true, _id: false, strict: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200, index: true },
    description: { type: String, required: true, trim: true, maxlength: 8000 },

    price: { type: Number, required: true, min: 0.01 },

    category: {
      type: String,
      required: true,
      enum: ['Women', 'Men', 'Accessories'],
      index: true,
    },

    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string' && x.length > 0);
        },
        message: 'Product must have at least 1 image URL',
      },
    },

    stock: { type: Number, default: 0, min: 0, index: true },

    tags: {
      type: [String],
      default: [],
      index: true,
      set: (arr) => (Array.isArray(arr) ? arr.map((t) => String(t).trim()).filter(Boolean) : []),
    },

    isActive: { type: Boolean, default: true, index: true },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5, index: true },
    ratingCount: { type: Number, default: 0, min: 0 },

    reviews: { type: [ReviewSchema], default: [] },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Compound index for filtered catalog browsing
ProductSchema.index({ isActive: 1, category: 1, createdAt: -1 });

// Text index for internal search
ProductSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  {
    weights: { name: 10, tags: 5, description: 2 },
  }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
