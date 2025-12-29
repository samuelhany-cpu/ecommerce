import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    // ✅ Don't expose it in queries by default
    // (In production الأفضل تخزن HASH بدل code plain text)
    code: {
      type: String,
      required: true,
      select: false,
      maxlength: 200,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },
    lastAttemptAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// TTL: remove expired OTPs automatically
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Useful query patterns
OTPSchema.index({ email: 1, expiresAt: -1 });

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
