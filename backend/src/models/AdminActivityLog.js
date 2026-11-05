const mongoose = require('../config/mysql-odm');

const adminActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      default: 'Admin',
    },
    adminEmail: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: ['legal', 'reporter', 'membership', 'complaint', 'news', 'user', 'settings'],
      index: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    targetModel: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

adminActivityLogSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);

