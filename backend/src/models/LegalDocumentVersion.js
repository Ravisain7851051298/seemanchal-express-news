const mongoose = require('../config/mysql-odm');

const legalDocumentVersionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LegalDocument',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    changeSummary: {
      type: String,
      default: 'Document content updated',
      trim: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for querying versions of a document in order
legalDocumentVersionSchema.index({ documentId: 1, versionNumber: -1 });

module.exports = mongoose.model('LegalDocumentVersion', legalDocumentVersionSchema);

