const express = require('express');
const router = express.Router();
const User = require('../models/User');
const News = require('../models/News');
const LegalDocument = require('../models/LegalDocument');
const Complaint = require('../models/Complaint');
const AdminActivityLog = require('../models/AdminActivityLog');
const { protect, authorize } = require('../middleware/auth');

// All routes here require Admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics & counters with real DB statistics
router.get('/stats', async (req, res) => {
  try {
    // 1. Reporter Metrics
    const totalReporters = await User.countDocuments({ role: 'reporter' });
    const activeReporters = await User.countDocuments({
      role: 'reporter',
      $or: [
        { reporterStatus: 'active' },
        { status: 'approved', reporterStatus: { $ne: 'suspended' } },
      ],
    });
    const suspendedReporters = await User.countDocuments({
      role: 'reporter',
      $or: [{ reporterStatus: 'suspended' }, { status: 'suspended' }],
    });
    const pendingReporters = await User.countDocuments({
      role: 'reporter',
      status: 'pending',
    });

    // 2. Member Metrics
    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({
      role: 'member',
      $or: [
        { membershipStatus: 'active' },
        { status: 'approved', membershipStatus: { $nin: ['suspended', 'expired'] } },
      ],
    });
    const expiredMemberships = await User.countDocuments({
      role: 'member',
      $or: [
        { membershipStatus: 'expired' },
        { membershipExpiryDate: { $lt: new Date() }, status: 'approved' },
      ],
    });
    const suspendedMembers = await User.countDocuments({
      role: 'member',
      $or: [{ membershipStatus: 'suspended' }, { status: 'suspended' }],
    });
    const pendingMembers = await User.countDocuments({
      role: 'member',
      status: 'pending',
    });

    // 3. Complaint Metrics
    const [
      pendingComplaints,
      complaintsUnderReview,
      resolvedComplaints,
      rejectedComplaints,
      totalComplaints,
    ] = await Promise.all([
      Complaint.countDocuments({ status: 'submitted' }),
      Complaint.countDocuments({ status: 'under_review' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'rejected' }),
      Complaint.countDocuments(),
    ]);

    // 4. Legal Document Metrics
    const [publishedLegalDocs, draftLegalDocs, totalLegalDocs] = await Promise.all([
      LegalDocument.countDocuments({ status: 'published', isDeleted: false }),
      LegalDocument.countDocuments({ status: 'draft', isDeleted: false }),
      LegalDocument.countDocuments({ isDeleted: false }),
    ]);

    // 5. News & Views
    const totalNewsPublished = await News.countDocuments({ status: 'published' });
    const pendingNewsReview = await News.countDocuments({ status: 'pending' });
    const rejectedNews = await News.countDocuments({ status: 'rejected' });
    const breakingNewsCount = await News.countDocuments({ status: 'published', isBreaking: true });
    const featuredNewsCount = await News.countDocuments({ status: 'published', isFeatured: true });
    const trendingNewsCount = await News.countDocuments({ status: 'published', isTrending: true });

    const viewsAgg = await News.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]);
    const totalViews = viewsAgg.length > 0 ? viewsAgg[0].totalViews : 0;

    // 6. Category Breakdown Aggregation for Analytics Graphs
    const categoryStats = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$categoryName', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]);

    // 7. Recent Publication & Readership Trends for Graphs
    const publicationTrends = await News.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: { $ifNull: ['$publishedAt', '$createdAt'] } } },
          stories: { $sum: 1 },
          views: { $sum: '$views' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    // 8. Complaints by Category
    const complaintCategories = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        // Reporter metrics
        totalReporters,
        activeReporters,
        suspendedReporters,
        pendingReporters,

        // Member metrics
        totalMembers,
        activeMembers,
        expiredMemberships,
        suspendedMembers,
        pendingMembers,

        // Application aggregate
        totalPendingApplications: pendingMembers + pendingReporters,

        // Complaint metrics
        pendingComplaints,
        complaintsUnderReview,
        resolvedComplaints,
        rejectedComplaints,
        totalComplaints,
        complaintCategories,

        // Legal metrics
        publishedLegalDocs,
        draftLegalDocs,
        totalLegalDocs,

        // News metrics & moderation pipeline
        totalNewsPublished,
        pendingNewsReview,
        rejectedNews,
        breakingNewsCount,
        featuredNewsCount,
        trendingNewsCount,
        totalViews,
        categoryStats,
        publicationTrends,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/applications
// @desc    Get applications list with filters
router.get('/applications', async (req, res) => {
  try {
    const { role, status = 'pending', search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/applications/:id/approve
// @desc    Approve application, assign designation, level, location and generate ID/Appointment
router.post('/applications/:id/approve', async (req, res) => {
  try {
    const {
      assignedDesignation,
      committeeLevel,
      assignedLocation,
      showOnTeamPage = true,
      validYears = 2,
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Application user not found' });
    }

    if (!assignedDesignation) {
      return res.status(400).json({ success: false, message: 'Please select an assigned designation/position' });
    }

    // Generate unique ID card number if not existing
    const prefix = user.role === 'reporter' ? 'SE-REP' : 'SE-MEM';
    const year = new Date().getFullYear();
    const count = await User.countDocuments({ role: user.role, status: 'approved' }) + 1;
    const seq = String(count).padStart(4, '0');
    const idCardNumber = user.idCardNumber || `${prefix}-${year}-${seq}`;

    // Validity date
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + (Number(validYears) || 2));

    // Reference number
    const appointmentRef = `SE/APPT/${year}/${seq}`;

    user.status = 'approved';
    user.assignedDesignation = assignedDesignation;
    
    // Validate and sanitize committeeLevel safely
    const validLevels = ['National', 'State', 'District', 'Block', 'Panchayat', 'Ward', 'Press', 'General', 'None'];
    let chosenLevel = committeeLevel || user.committeeLevel;
    if (!chosenLevel || !validLevels.includes(chosenLevel)) {
      chosenLevel = user.role === 'reporter' ? 'Press' : 'District';
    }
    user.committeeLevel = chosenLevel;

    user.assignedLocation = assignedLocation || user.assignedLocation || (user.role === 'reporter' ? 'Field Bureau' : 'Seemanchal Region');
    user.idCardNumber = idCardNumber;
    user.idCardValidUntil = validUntil;
    user.appointmentLetterDate = new Date();
    user.appointmentReferenceNo = appointmentRef;
    user.showOnTeamPage = Boolean(showOnTeamPage);
    user.rejectionReason = '';

    if (!user.statusHistory) {
      user.statusHistory = [];
    }
    user.statusHistory.push({
      oldStatus: 'pending',
      newStatus: 'active',
      statusType: user.role === 'reporter' ? 'reporter' : 'membership',
      reason: 'Application Approved',
      remarks: `Commissioned as ${assignedDesignation} (${chosenLevel} Level) - ID: ${idCardNumber}`,
      changedBy: req.user?._id || null,
      changedByName: req.user?.name || 'Administrator',
      changedAt: new Date(),
    });

    await user.save();

    res.json({
      success: true,
      message: `Application approved! Assigned as ${assignedDesignation} (${committeeLevel} level). ID: ${idCardNumber}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/applications/:id/reject
// @desc    Reject application with optional reason
router.post('/applications/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'rejected';
    user.rejectionReason = reason || 'Your application did not meet our current requirements.';
    user.showOnTeamPage = false;
    await user.save();

    res.json({ success: true, message: 'Application has been rejected', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (members, reporters, admins)
router.get('/users', async (req, res) => {
  try {
    const { role, status, search, level } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (level) query.committeeLevel = level;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { idCardNumber: { $regex: search, $options: 'i' } },
        { assignedDesignation: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details, designation, team visibility, status
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const allowedFields = [
      'name', 'phone', 'role', 'status', 'assignedDesignation',
      'committeeLevel', 'assignedLocation', 'showOnTeamPage', 'bio',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();
    res.json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin' && user.email === 'admin@seemanchalexpress.in') {
      return res.status(400).json({ success: false, message: 'Cannot delete primary admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/news
// @desc    Get all news (including drafts, pending reviews, published)
router.get('/news', async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
      ];
    }

    const news = await News.find(query)
      .populate('category', 'name nameHindi slug')
      .populate('categories', 'name nameHindi slug')
      .populate('author', 'name email phone role photo assignedDesignation assignedLocation committeeLevel bio idCardNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: news.length, news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/news/:id/status
// @desc    Approve or reject reporter news
router.put('/news/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason, isBreaking, isFeatured, isTrending } = req.body;
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'News not found' });

    if (status) {
      news.status = status;
      if (status === 'published' && !news.publishedAt) {
        news.publishedAt = new Date();
      }
    }

    if (rejectionReason !== undefined) news.rejectionReason = rejectionReason;
    if (isBreaking !== undefined) news.isBreaking = Boolean(isBreaking);
    if (isFeatured !== undefined) news.isFeatured = Boolean(isFeatured);
    if (isTrending !== undefined) news.isTrending = Boolean(isTrending);

    await news.save();

    const updatedNews = await News.findById(news._id)
      .populate('category', 'name nameHindi slug')
      .populate('categories', 'name nameHindi slug')
      .populate('author', 'name email phone role photo assignedDesignation assignedLocation committeeLevel bio idCardNumber');

    res.json({ success: true, message: `News status changed to ${status}`, news: updatedNews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// REPORTER MANAGEMENT SYSTEM
// ==========================================

// @route   GET /api/admin/reporters
// @desc    Get all reporters with status filter & statistics
router.get('/reporters', async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { role: 'reporter' };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.$or = [
          { reporterStatus: 'active' },
          { status: 'approved', reporterStatus: { $ne: 'suspended' } },
        ];
      } else if (status === 'suspended') {
        query.$or = [{ reporterStatus: 'suspended' }, { status: 'suspended' }];
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { idCardNumber: { $regex: search, $options: 'i' } },
            { assignedLocation: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const reporters = await User.find(query).select('-password').sort({ updatedAt: -1 });

    const [total, active, suspended, pending, rejected] = await Promise.all([
      User.countDocuments({ role: 'reporter' }),
      User.countDocuments({
        role: 'reporter',
        $or: [{ reporterStatus: 'active' }, { status: 'approved', reporterStatus: { $ne: 'suspended' } }],
      }),
      User.countDocuments({
        role: 'reporter',
        $or: [{ reporterStatus: 'suspended' }, { status: 'suspended' }],
      }),
      User.countDocuments({ role: 'reporter', status: 'pending' }),
      User.countDocuments({ role: 'reporter', status: 'rejected' }),
    ]);

    res.json({
      success: true,
      count: reporters.length,
      counts: { total, active, suspended, pending, rejected },
      reporters,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/reporters/:id/status
// @desc    Update reporter status (Activate, Suspend, Restore, Reject)
router.put('/reporters/:id/status', async (req, res) => {
  try {
    const { action, reason, remarks } = req.body;
    const reporter = await User.findOne({ _id: req.params.id, role: 'reporter' });
    if (!reporter) {
      return res.status(404).json({ success: false, message: 'Reporter not found' });
    }

    const oldStatus = reporter.reporterStatus || reporter.status;
    let newStatus = oldStatus;

    if (action === 'suspend') {
      newStatus = 'suspended';
      reporter.reporterStatus = 'suspended';
      reporter.status = 'suspended';
      reporter.suspensionReason = reason || remarks || 'Administrative suspension';
      reporter.suspensionDate = new Date();
      reporter.adminRemarks = remarks || '';
    } else if (action === 'activate' || action === 'restore') {
      newStatus = 'active';
      reporter.reporterStatus = 'active';
      reporter.status = 'approved';
      reporter.suspensionReason = '';
      reporter.adminRemarks = remarks || '';
    } else if (action === 'reject') {
      newStatus = 'rejected';
      reporter.reporterStatus = 'rejected';
      reporter.status = 'rejected';
      reporter.rejectionReason = reason || remarks || 'Application rejected';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action provided' });
    }

    reporter.statusHistory.push({
      oldStatus,
      newStatus,
      statusType: 'reporter',
      reason: reason || '',
      remarks: remarks || '',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
    });

    await reporter.save();

    // Log Activity
    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: `REPORTER_${action.toUpperCase()}`,
      module: 'reporter',
      targetId: reporter._id.toString(),
      targetModel: 'User',
      details: {
        name: reporter.name,
        email: reporter.email,
        action,
        reason: reason || remarks,
      },
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: `Reporter ${reporter.name} has been ${action === 'suspend' ? 'suspended' : action === 'restore' ? 'restored' : action === 'activate' ? 'activated' : 'rejected'}.`,
      reporter,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// MEMBERSHIP MANAGEMENT SYSTEM
// ==========================================

// @route   GET /api/admin/members
// @desc    Get all members with status filter, expiry check & statistics
router.get('/members', async (req, res) => {
  try {
    const { status, search, level } = req.query;

    // Automatic backend expiry validation for all active members
    await User.updateMany(
      {
        role: 'member',
        status: 'approved',
        membershipExpiryDate: { $lt: new Date() },
        membershipStatus: { $ne: 'expired' },
      },
      {
        $set: { membershipStatus: 'expired' },
      }
    );

    const query = { role: 'member' };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.$or = [
          { membershipStatus: 'active' },
          { status: 'approved', membershipStatus: { $nin: ['suspended', 'expired'] } },
        ];
      } else if (status === 'expired') {
        query.membershipStatus = 'expired';
      } else if (status === 'suspended') {
        query.$or = [{ membershipStatus: 'suspended' }, { status: 'suspended' }];
      } else {
        query.status = status;
      }
    }

    if (level && level !== 'all') {
      query.committeeLevel = level;
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { idCardNumber: { $regex: search, $options: 'i' } },
            { assignedDesignation: { $regex: search, $options: 'i' } },
            { assignedLocation: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const members = await User.find(query).select('-password').sort({ updatedAt: -1 });

    const [total, active, expired, suspended, pending, rejected] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({
        role: 'member',
        $or: [
          { membershipStatus: 'active' },
          { status: 'approved', membershipStatus: { $nin: ['suspended', 'expired'] } },
        ],
      }),
      User.countDocuments({ role: 'member', membershipStatus: 'expired' }),
      User.countDocuments({
        role: 'member',
        $or: [{ membershipStatus: 'suspended' }, { status: 'suspended' }],
      }),
      User.countDocuments({ role: 'member', status: 'pending' }),
      User.countDocuments({ role: 'member', status: 'rejected' }),
    ]);

    res.json({
      success: true,
      count: members.length,
      counts: { total, active, expired, suspended, pending, rejected },
      members,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/members/:id/status
// @desc    Update member status (Activate, Suspend, Renew, Expire)
router.put('/members/:id/status', async (req, res) => {
  try {
    const { action, startDate, expiryDate, reason, remarks, yearsToExtend = 2 } = req.body;
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const oldStatus = member.membershipStatus || member.status;
    let newStatus = oldStatus;

    if (action === 'activate') {
      newStatus = 'active';
      member.membershipStatus = 'active';
      member.status = 'approved';
      member.membershipStartDate = startDate ? new Date(startDate) : (member.membershipStartDate || new Date());
      if (expiryDate) {
        member.membershipExpiryDate = new Date(expiryDate);
      } else if (!member.membershipExpiryDate || member.membershipExpiryDate < new Date()) {
        const exp = new Date(member.membershipStartDate);
        exp.setFullYear(exp.getFullYear() + Number(yearsToExtend));
        member.membershipExpiryDate = exp;
      }
      member.suspensionReason = '';
      member.adminRemarks = remarks || '';
    } else if (action === 'renew') {
      newStatus = 'active';
      member.membershipStatus = 'active';
      member.status = 'approved';
      const baseDate = startDate ? new Date(startDate) : new Date();
      member.membershipStartDate = baseDate;
      if (expiryDate) {
        member.membershipExpiryDate = new Date(expiryDate);
      } else {
        const exp = new Date(baseDate);
        exp.setFullYear(exp.getFullYear() + Number(yearsToExtend));
        member.membershipExpiryDate = exp;
      }
      // Also update ID card validity
      member.idCardValidUntil = member.membershipExpiryDate;
      member.suspensionReason = '';
      member.adminRemarks = remarks || `Renewed for ${yearsToExtend} years.`;
    } else if (action === 'suspend') {
      newStatus = 'suspended';
      member.membershipStatus = 'suspended';
      member.status = 'suspended';
      member.suspensionReason = reason || remarks || 'Membership suspended';
      member.suspensionDate = new Date();
      member.adminRemarks = remarks || '';
    } else if (action === 'expire') {
      newStatus = 'expired';
      member.membershipStatus = 'expired';
      member.membershipExpiryDate = new Date();
      member.adminRemarks = remarks || 'Marked as expired by administrator';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action provided' });
    }

    member.statusHistory.push({
      oldStatus,
      newStatus,
      statusType: 'membership',
      reason: reason || '',
      remarks: remarks || `Membership action: ${action}`,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
    });

    await member.save();

    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: `MEMBERSHIP_${action.toUpperCase()}`,
      module: 'membership',
      targetId: member._id.toString(),
      targetModel: 'User',
      details: {
        name: member.name,
        email: member.email,
        action,
        expiryDate: member.membershipExpiryDate,
        remarks: remarks || reason,
      },
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: `Member ${member.name} status updated: ${action.toUpperCase()}`,
      member,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ADMIN ACTIVITY AUDIT LOGS
// ==========================================

// @route   GET /api/admin/activity-logs
// @desc    View audit logs of sensitive admin operations
router.get('/activity-logs', async (req, res) => {
  try {
    const { module: mod, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (mod && mod !== 'all') {
      query.module = mod;
    }
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AdminActivityLog.countDocuments(query);
    const logs = await AdminActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
