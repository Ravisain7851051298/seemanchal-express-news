const mongoose = require('../config/mysql-odm');

const legalDocumentAcceptanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LegalDocument',
      required: true,
      index: true,
    },
    documentSlug: {
      type: String,
      required: true,
      index: true,
    },
    documentTitle: {
      type: String,
      default: '',
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    roleAtAcceptance: {
      type: String,
      enum: ['member', 'reporter', 'admin', 'user'],
      default: 'member',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find if user accepted this doc version
legalDocumentAcceptanceSchema.index({ userId: 1, documentId: 1, versionNumber: 1 });

module.exports = mongoose.model('LegalDocumentAcceptance', legalDocumentAcceptanceSchema);

