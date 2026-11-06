const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const AdminActivityLog = require('../models/AdminActivityLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get site settings (public access for footer, about, contact, and header)
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve site settings',
      error: err.message,
    });
  }
});

// @route   PUT /api/settings
// @desc    Update site settings (Admin only)
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      organizationName,
      tagline,
      credentials,
      socialLinks,
      aboutUs,
      contactUs,
    } = req.body;

    let settings = await SiteSettings.getSettings();

    const toPlain = (v) => (v && typeof v.toObject === 'function' ? v.toObject() : v || {});

    if (organizationName !== undefined) settings.organizationName = organizationName;
    if (tagline !== undefined) settings.tagline = tagline;

    // Update credentials (official seal, president signature, etc.)
    if (credentials) {
      settings.credentials = {
        ...toPlain(settings.credentials),
        ...credentials,
      };
    }

    // Update social media links
    if (socialLinks) {
      settings.socialLinks = {
        ...toPlain(settings.socialLinks),
        ...socialLinks,
      };
    }

    // Update About Us content
    if (aboutUs) {
      settings.aboutUs = {
        ...toPlain(settings.aboutUs),
        ...aboutUs,
      };
    }

    // Update Contact Us content
    if (contactUs) {
      settings.contactUs = {
        ...toPlain(settings.contactUs),
        ...contactUs,
      };
    }

    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    // Log admin activity
    try {
      await AdminActivityLog.create({
        action: 'UPDATE_SETTINGS',
        module: 'settings',
        adminId: req.user._id,
        adminName: req.user.name,
        adminEmail: req.user.email || '',
        targetId: String(settings._id),
        targetModel: 'SiteSettings',
        details: 'Updated site configuration, institutional credentials, and page content',
        ipAddress: req.ip || '',
      });
    } catch (logErr) {
      console.warn('Failed to record activity log:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update site settings',
      error: err.message,
    });
  }
});

module.exports = router;

