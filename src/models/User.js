import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // ✅ never return by default
    },

    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    firstName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },

    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 30,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Compound index for email and verification status
UserSchema.index({ email: 1, isVerified: 1 });

// ✅ hide sensitive/internal fields
UserSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
UserSchema.set('toObject', {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
