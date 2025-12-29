import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 200,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
      index: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      index: true,
    },
    ip: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },

    // ✅ GeoJSON (better for real production geo queries)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
      city: { type: String, trim: true, default: '' },
      region: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: 400,
      default: '',
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // ✅ createdAt/updatedAt
    strict: true,
  }
);

// ✅ Query performance indexes
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ endpoint: 1, createdAt: -1 });

// ✅ Geo index
AuditLogSchema.index({ location: '2dsphere' });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
