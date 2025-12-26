import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    action: {
        type: String,
        required: true,
        index: true
    },
    endpoint: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    location: {
        city: String,
        region: String,
        country: String,
        ll: [Number] // Latitude, Longitude
    },
    userAgent: {
        type: String
    },
    data: {
        type: mongoose.Schema.Types.Mixed // Optional extra data
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for easier querying of specific user actions
AuditLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
