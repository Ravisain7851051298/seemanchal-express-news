const express = require('express');
const router = express.Router();
const LegalDocument = require('../models/LegalDocument');
const LegalDocumentVersion = require('../models/LegalDocumentVersion');
const LegalDocumentAcceptance = require('../models/LegalDocumentAcceptance');
const AdminActivityLog = require('../models/AdminActivityLog');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Utility for slugification
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// ==========================================
// 1. PUBLIC ROUTES (Drafts never exposed)
// ==========================================

// @route   GET /api/legal
// @desc    Get all published legal documents (catalog for public landing & footer)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {
      status: 'published',
      isDeleted: false,
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await LegalDocument.find(filter)
      .select('title slug category summary version effectiveDate lastUpdated publishedAt isMandatoryFor')
      .sort({ title: 1 });

    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/legal/:slug
// @desc    Get single published legal document by slug (404 for draft / unpublished)
router.get('/view/:slug', async (req, res) => {
  try {
    const doc = await LegalDocument.findOne({
      slug: req.params.slug.toLowerCase(),
      status: 'published',
      isDeleted: false,
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Legal document not found, unpublished, or archived.',
      });
    }

    res.json({
      success: true,
      document: doc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. USER ACCEPTANCE ROUTES (Authenticated)
// ==========================================

// @route   GET /api/legal/acceptance/my-pending
// @desc    Get mandatory agreements user has NOT accepted for current version
router.get('/acceptance/my-pending', protect, async (req, res) => {
  try {
    const userRole = req.user.role; // 'reporter' or 'member'
    if (userRole === 'admin') {
      return res.json({ success: true, pendingDocuments: [] });
    }

    // Find all published documents mandatory for this user's role
    const mandatoryDocs = await LegalDocument.find({
      status: 'published',
      isDeleted: false,
      isMandatoryFor: userRole,
    }).select('title slug category summary version effectiveDate lastUpdated isMandatoryFor');

    const pendingDocuments = [];

    for (const doc of mandatoryDocs) {
      const acceptance = await LegalDocumentAcceptance.findOne({
        userId: req.user._id,
        documentId: doc._id,
        versionNumber: doc.version,
      });

      if (!acceptance) {
        pendingDocuments.push(doc);
      }
    }

    res.json({
      success: true,
      pendingCount: pendingDocuments.length,
      pendingDocuments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/legal/acceptance/my-status
// @desc    Get user's full legal status: pending mandatory agreements + accepted agreements history
router.get('/acceptance/my-status', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole === 'admin') {
      return res.json({
        success: true,
        isCompliant: true,
        pendingCount: 0,
        pendingDocuments: [],
        acceptedDocuments: [],
      });
    }

    // 1. Mandatory docs for this user's role
    const mandatoryDocs = await LegalDocument.find({
      status: 'published',
      isDeleted: false,
      isMandatoryFor: userRole,
    }).select('title slug category summary version effectiveDate lastUpdated isMandatoryFor');

    const pendingDocuments = [];
    const acceptedDocuments = [];

    for (const doc of mandatoryDocs) {
      const acceptance = await LegalDocumentAcceptance.findOne({
        userId: req.user._id,
        documentId: doc._id,
        versionNumber: doc.version,
      }).sort({ acceptedAt: -1 });

      if (!acceptance) {
        pendingDocuments.push(doc);
      } else {
        acceptedDocuments.push({
          document: doc,
          acceptance,
        });
      }
    }

    // All acceptances recorded by this user
    const allUserAcceptances = await LegalDocumentAcceptance.find({
      userId: req.user._id,
    }).sort({ acceptedAt: -1 });

    res.json({
      success: true,
      isCompliant: pendingDocuments.length === 0,
      pendingCount: pendingDocuments.length,
      acceptedCount: acceptedDocuments.length,
      pendingDocuments,
      acceptedDocuments,
      allAcceptances: allUserAcceptances,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/legal/acceptance/:id
// @desc    Record explicit user acceptance of a legal document
router.post('/acceptance/:id', protect, async (req, res) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc || doc.isDeleted || doc.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Document not found or not active' });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Check if already accepted for this version
    let acceptance = await LegalDocumentAcceptance.findOne({
      userId: req.user._id,
      documentId: doc._id,
      versionNumber: doc.version,
    });

    if (acceptance) {
      return res.json({
        success: true,
        message: 'Document version already accepted',
        acceptance,
      });
    }

    acceptance = await LegalDocumentAcceptance.create({
      userId: req.user._id,
      documentId: doc._id,
      documentSlug: doc.slug,
      documentTitle: doc.title,
      versionNumber: doc.version,
      roleAtAcceptance: req.user.role,
      ipAddress,
      userAgent,
      acceptedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Agreement "${doc.title}" (Version ${doc.version}) accepted successfully.`,
      acceptance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. ADMIN MANAGEMENT ROUTES
// ==========================================

// @route   GET /api/legal/admin/all
// @desc    List all documents (published, drafts, archived) for Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = { isDeleted: false };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await LegalDocument.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 });

    const totalCount = await LegalDocument.countDocuments({ isDeleted: false });
    const publishedCount = await LegalDocument.countDocuments({ status: 'published', isDeleted: false });
    const draftCount = await LegalDocument.countDocuments({ status: 'draft', isDeleted: false });
    const archivedCount = await LegalDocument.countDocuments({ status: 'archived', isDeleted: false });

    res.json({
      success: true,
      counts: {
        total: totalCount,
        published: publishedCount,
        draft: draftCount,
        archived: archivedCount,
      },
      documents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/legal/admin
// @desc    Create new legal document
router.post('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      summary,
      content,
      status = 'published',
      effectiveDate,
      isMandatoryFor = [],
    } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Title, category, and content are required' });
    }

    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) finalSlug = `policy-${Date.now()}`;

    const existing = await LegalDocument.findOne({ slug: finalSlug, isDeleted: false });
    if (existing) {
      return res.status(400).json({ success: false, message: `A document with slug "${finalSlug}" already exists.` });
    }

    const doc = await LegalDocument.create({
      title,
      slug: finalSlug,
      category,
      summary: summary || '',
      content,
      status,
      version: 1,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      lastUpdated: new Date(),
      publishedAt: status === 'published' ? new Date() : null,
      isMandatoryFor: Array.isArray(isMandatoryFor) ? isMandatoryFor : [],
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    // Record initial version in history
    await LegalDocumentVersion.create({
      documentId: doc._id,
      versionNumber: 1,
      title: doc.title,
      content: doc.content,
      changeSummary: 'Initial policy creation and publication',
      changedBy: req.user._id,
    });

    // Activity Log
    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'CREATE_LEGAL_DOC',
      module: 'legal',
      targetId: doc._id.toString(),
      targetModel: 'LegalDocument',
      details: { title: doc.title, slug: doc.slug, status: doc.status },
      ipAddress: req.ip || '',
    });

    res.status(201).json({
      success: true,
      message: `Legal Document "${doc.title}" created successfully.`,
      document: doc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/legal/admin/:id
// @desc    Update legal document & create version history
router.put('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      summary,
      content,
      status,
      effectiveDate,
      isMandatoryFor,
      changeSummary,
      isMaterialUpdate,
    } = req.body;

    const doc = await LegalDocument.findById(req.params.id);
    if (!doc || doc.isDeleted) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const isContentChanged = content && content.trim() !== doc.content.trim();
    const isTitleChanged = title && title.trim() !== doc.title.trim();
    const shouldIncrementVersion = Boolean(isMaterialUpdate || (isContentChanged && changeSummary));

    if (shouldIncrementVersion) {
      doc.version += 1;
    }

    if (title) doc.title = title;
    if (slug) {
      const sanitizedSlug = slugify(slug);
      if (sanitizedSlug !== doc.slug) {
        const slugConflict = await LegalDocument.findOne({ slug: sanitizedSlug, _id: { $ne: doc._id } });
        if (slugConflict) {
          return res.status(400).json({ success: false, message: 'Slug is already used by another document.' });
        }
        doc.slug = sanitizedSlug;
      }
    }
    if (category) doc.category = category;
    if (summary !== undefined) doc.summary = summary;
    if (content) doc.content = content;
    if (status) {
      doc.status = status;
      if (status === 'published' && !doc.publishedAt) {
        doc.publishedAt = new Date();
      }
    }
    if (effectiveDate) doc.effectiveDate = new Date(effectiveDate);
    if (isMandatoryFor !== undefined) doc.isMandatoryFor = isMandatoryFor;

    doc.lastUpdated = new Date();
    doc.updatedBy = req.user._id;

    await doc.save();

    // Create version snapshot if changed
    if (isContentChanged || isTitleChanged || shouldIncrementVersion) {
      await LegalDocumentVersion.create({
        documentId: doc._id,
        versionNumber: doc.version,
        title: doc.title,
        content: doc.content,
        changeSummary: changeSummary || 'Content updated by admin',
        changedBy: req.user._id,
      });
    }

    // Activity Log
    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'UPDATE_LEGAL_DOC',
      module: 'legal',
      targetId: doc._id.toString(),
      targetModel: 'LegalDocument',
      details: { title: doc.title, version: doc.version, changeSummary },
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: `Document "${doc.title}" updated (Version ${doc.version}).`,
      document: doc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/legal/admin/:id/status
// @desc    Toggle publish / draft / archive status
router.patch('/admin/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const doc = await LegalDocument.findById(req.params.id);
    if (!doc || doc.isDeleted) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.status = status;
    if (status === 'published' && !doc.publishedAt) {
      doc.publishedAt = new Date();
    }
    doc.lastUpdated = new Date();
    doc.updatedBy = req.user._id;
    await doc.save();

    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: `STATUS_LEGAL_DOC_${status.toUpperCase()}`,
      module: 'legal',
      targetId: doc._id.toString(),
      targetModel: 'LegalDocument',
      details: { title: doc.title, newStatus: status },
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: `Document status changed to ${status}.`,
      document: doc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/legal/admin/:id
// @desc    Soft delete legal document
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doc = await LegalDocument.findById(req.params.id);
    if (!doc || doc.isDeleted) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.isDeleted = true;
    doc.updatedBy = req.user._id;
    await doc.save();

    await AdminActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: 'DELETE_LEGAL_DOC',
      module: 'legal',
      targetId: doc._id.toString(),
      targetModel: 'LegalDocument',
      details: { title: doc.title, slug: doc.slug },
      ipAddress: req.ip || '',
    });

    res.json({
      success: true,
      message: `Document "${doc.title}" removed.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/legal/admin/:id/versions
// @desc    Get version history of document
router.get('/admin/:id/versions', protect, authorize('admin'), async (req, res) => {
  try {
    const versions = await LegalDocumentVersion.find({ documentId: req.params.id })
      .populate('changedBy', 'name email')
      .sort({ versionNumber: -1 });

    res.json({
      success: true,
      count: versions.length,
      versions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/legal/admin/acceptances
// @desc    View user acceptance records
router.get('/admin/acceptances', protect, authorize('admin'), async (req, res) => {
  try {
    const { documentSlug, role, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (documentSlug) filter.documentSlug = documentSlug;
    if (role) filter.roleAtAcceptance = role;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await LegalDocumentAcceptance.countDocuments(filter);
    const acceptances = await LegalDocumentAcceptance.find(filter)
      .populate('userId', 'name email phone role idCardNumber assignedDesignation assignedLocation')
      .sort({ acceptedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      acceptances,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/legal/admin/compliance-audit
// @desc    View who does NOT accept policy, the type of policy, and their role (Reporter or Member)
router.get('/admin/compliance-audit', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, documentSlug, search } = req.query;

    // 1. Get all published mandatory legal documents
    const docQuery = {
      status: 'published',
      isDeleted: false,
      isMandatoryFor: { $in: ['reporter', 'member'] },
    };
    if (documentSlug && documentSlug !== 'all') {
      docQuery.slug = documentSlug;
    }

    const mandatoryDocs = await LegalDocument.find(docQuery).select(
      'title slug category version effectiveDate isMandatoryFor'
    );

    // 2. Query approved / active users
    const userQuery = {
      role: { $in: ['reporter', 'member'] },
      status: { $in: ['approved', 'active'] },
    };
    if (role && role !== 'all') {
      userQuery.role = role;
    }
    if (search && search.trim()) {
      userQuery.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const users = await User.find(userQuery).select(
      'name email phone role status assignedDesignation assignedLocation committeeLevel idCardNumber photo createdAt'
    );

    // 3. For each user, check which mandatory documents for their role are unaccepted
    const pendingAudit = [];

    for (const u of users) {
      const userMandatoryDocs = mandatoryDocs.filter(
        (d) => Array.isArray(d.isMandatoryFor) && d.isMandatoryFor.includes(u.role)
      );

      const unacceptedDocuments = [];

      for (const d of userMandatoryDocs) {
        const acceptance = await LegalDocumentAcceptance.findOne({
          userId: u._id,
          documentId: d._id,
          versionNumber: d.version,
        });

        if (!acceptance) {
          unacceptedDocuments.push({
            _id: d._id,
            title: d.title,
            slug: d.slug,
            category: d.category,
            version: d.version,
            effectiveDate: d.effectiveDate,
          });
        }
      }

      if (unacceptedDocuments.length > 0) {
        pendingAudit.push({
          user: u,
          unacceptedDocuments,
          unacceptedCount: unacceptedDocuments.length,
        });
      }
    }

    const totalReportersPending = pendingAudit.filter((p) => p.user.role === 'reporter').length;
    const totalMembersPending = pendingAudit.filter((p) => p.user.role === 'member').length;

    res.json({
      success: true,
      totalPendingUsers: pendingAudit.length,
      totalReportersPending,
      totalMembersPending,
      mandatoryDocs,
      audit: pendingAudit,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

