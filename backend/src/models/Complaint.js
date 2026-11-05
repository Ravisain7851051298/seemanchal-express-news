const mongoose = require('../config/mysql-odm');

const complaintSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Incorrect News',
        'Content Removal Request',
        'Copyright Complaint',
        'Privacy Complaint',
        'Reporter Misconduct',
        'Membership Issue',
        'Technical Issue',
        'General Complaint',
        'Other',
      ],
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedNewsUrl: {
      type: String,
      trim: true,
      default: '',
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'resolved', 'rejected', 'closed'],
      default: 'submitted',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    internalNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedByName: { type: String, default: 'Admin' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    resolutionRemarks: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        oldStatus: { type: String, default: '' },
        newStatus: { type: String, required: true },
        remarks: { type: String, default: '' },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedByName: { type: String, default: 'System' },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for secure public tracking
complaintSchema.index({ referenceNumber: 1, email: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);

