const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const AdminActivityLog = require('../models/AdminActivityLog');
const { protect, authorize } = require('../middleware/auth');

// Simple in-memory rate limiting map for public complaints (max 5 per IP per 10 mins)
const rateLimitMap = new Map();
const checkRateLimit = (ip) => {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 10;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return true;
  }

  const timestamps = rateLimitMap.get(ip).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
};

// Generate unique reference number: GRV-2026-XXXXX
const generateReferenceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const seq = String(count + 1).padStart(4, '0');
  return `GRV-${year}-${seq}${randomChars}`;
};

// ==========================================
// 1. PUBLIC COMPLAINT SUBMISSION
// ==========================================

// @route   POST /api/complaints
// @desc    Submit a complaint / grievance (Public / Visitors / Members / Reporters)
router.post('/', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests submitted. Please wait a few minutes before submitting another complaint.',
      });
    }

    const {
      fullName,
      email,
      phone,
      category,
      subject,
      description,
      relatedNewsUrl,
      attachmentUrl,
      userId,
    } = req.body;

    if (!fullName || !email || !category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, category, subject, and description.',
      });
    }

    const validCategories = [
      'Incorrect News',
      'Content Removal Request',
      'Copyright Complaint',
      'Privacy Complaint',
      'Reporter Misconduct',
      'Membership Issue',
      'Technical Issue',
      'General Complaint',
      'Other',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint category selected.',
      });
    }

    const referenceNumber = await generateReferenceNumber();

    const complaint = await Complaint.create({
      referenceNumber,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      category,
      subject: subject.trim(),
      description: description.trim(),
      relatedNewsUrl: relatedNewsUrl ? relatedNewsUrl.trim() : '',
      attachmentUrl: attachmentUrl ? attachmentUrl.trim() : '',
      userId: userId || null,
      status: 'submitted',
      statusHistory: [
        {
          oldStatus: '',
          newStatus: 'submitted',
          remarks: 'Complaint registered and assigned initial reference number',
          changedByName: 'Grievance System',
          changedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. Please save your Reference Number for tracking.',
      referenceNumber: complaint.referenceNumber,
      createdAt: complaint.createdAt,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. PUBLIC SECURE COMPLAINT TRACKING
// ==========================================

// @route   POST /api/complaints/track
// @desc    Track status using referenceNumber + email (Secure: No internal notes exposed)
router.post('/track', async (req, res) => {
  try {
    const { referenceNumber, email } = req.body;

    if (!referenceNumber || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the Reference Number and the registered Email address.',
      });
    }

    const complaint = await Complaint.findOne({
      referenceNumber: referenceNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
    }).select('-internalNotes -assignedTo');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'No grievance record found with the provided Reference Number and Email combination.',
      });
    }

    // Sanitize status history for public consumption (remove user/admin IDs)
    const publicHistory = complaint.statusHistory.map((h) => ({
      status: h.newStatus,
      remarks: h.remarks,
      date: h.changedAt,
    }));

    res.json({
      success: true,
      complaint: {
        referenceNumber: complaint.referenceNumber,
        fullName: complaint.fullName,
        category: complaint.category,
        subject: complaint.subject,
        description: complaint.description,
        relatedNewsUrl: complaint.relatedNewsUrl,
        attachmentUrl: complaint.attachmentUrl,
        status: complaint.status,
        resolutionRemarks: complaint.resolutionRemarks,
        rejectionReason: complaint.rejectionReason,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        history: publicHistory,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. ADMIN COMPLAINT DESK ROUTES
// ==========================================

// @route   GET /api/complaints/admin/all
// @desc    List and filter complaints for Admin Desk
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name email assignedDesignation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Summary counts for dashboard metrics
    const [totalAll, submittedCount, underReviewCount, resolvedCount, rejectedCount, closedCount] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: 'submitted' }),
        Complaint.countDocuments({ status: 'under_review' }),
        Complaint.countDocuments({ status: 'resolved' }),
        Complaint.countDocuments({ status: 'rejected' }),
        Complaint.countDocuments({ status: 'closed' }),
      ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      counts: {
        total: totalAll,
        submitted: submittedCount,
        under_review: underReviewCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
        closed: closedCount,
      },
      complaints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/complaints/admin/:id
// @desc    Get complete complaint record including internal notes and audit history
router.get('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedTo', 'name email role assignedDesignation')
      .populate('internalNotes.addedBy', 'name email')
      .populate('userId', 'name email role idCardNumber');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/complaints/admin/:id/status
// @desc    Update complaint status, assign remarks/rejection reasons, append audit history
router.put('/admin/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, remarks, resolutionRemarks, rejectionReason, assignedTo } = req.body;
    const validStatuses = ['submitted', 'under_review', 'resolved', 'rejected', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    if (resolutionRemarks !== undefined) complaint.resolutionRemarks = resolutionRemarks;
    if (rejectionReason !== undefined) complaint.rejectionReason = rejectionReason;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;

    // Record in status history
    complaint.statusHistory.push({
      oldStatus,
      newStatus: status,
      remarks: remarks || resolutionRemarks || rejectionReason || `Status updated to ${status}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
    });

    await complaint.save();

    // Log admin activity
    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: `COMPLAINT_STATUS_${status.toUpperCase()}`,
      module: 'complaint',
      targetId: complaint._id.toString(),
      targetModel: 'Complaint',
      details: {
        referenceNumber: complaint.referenceNumber,
        oldStatus,
        newStatus: status,
        remarks: remarks || resolutionRemarks || rejectionReason,
      },
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: `Complaint ${complaint.referenceNumber} status updated to ${status}`,
      complaint,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/complaints/admin/:id/note
// @desc    Add an internal administrative note (Never exposed publicly)
router.post('/admin/:id/note', protect, authorize('admin'), async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.internalNotes.push({
      note: note.trim(),
      addedBy: req.user._id,
      addedByName: req.user.name,
      addedAt: new Date(),
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Internal note saved successfully',
      internalNotes: complaint.internalNotes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/complaints/admin/:id/assign
// @desc    Assign complaint to an administrator
router.put('/admin/:id/assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = assignedTo || null;
    await complaint.save();

    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'ASSIGN_COMPLAINT',
      module: 'complaint',
      targetId: complaint._id.toString(),
      targetModel: 'Complaint',
      details: { referenceNumber: complaint.referenceNumber, assignedTo },
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

