const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const { protect } = require('../middleware/auth');

const ORG_DETAILS = {
  name: 'Seemanchal Express',
  tagline: 'Voice of the People | सच की निर्भीक आवाज',
  email: 'mail@seemanchalexpress.in',
  phone: '+91 9871023184',
  address: 'F 65, Shaheen Bagh, Okhla, New Delhi-110025',
  website: 'https://seemanchalexpress.in',
  authorizedSignatory: 'Nation Correspondence / Editor-in-Chief',
};

// @route   GET /api/documents/id-card/:userId
// @desc    Get ID card metadata & details for print/download
router.get('/id-card/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only allow admin, or the user themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (user.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Application is still pending or not approved. ID card is available only for approved members/reporters.',
      });
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${user.idCardNumber || user._id}`;
    const settings = await SiteSettings.getSettings();

    res.json({
      success: true,
      cardData: {
        idCardNumber: user.idCardNumber,
        name: user.name,
        role: user.role,
        assignedDesignation: user.assignedDesignation || 'Member',
        committeeLevel: user.committeeLevel || 'General',
        assignedLocation: user.assignedLocation || 'Seemanchal Region',
        phone: user.phone,
        email: user.email,
        bloodGroup: user.bloodGroup || 'N/A',
        photo: user.photo,
        idProofNumber: user.idProofNumber ? `***${user.idProofNumber.slice(-4)}` : 'Verified',
        issueDate: user.appointmentLetterDate || user.updatedAt,
        validUntil: user.idCardValidUntil,
        verificationUrl,
        officialSeal: settings.credentials?.officialSeal || '',
        presidentSignature: settings.credentials?.presidentSignature || '',
        signatoryName: settings.credentials?.signatoryName || 'Nation Correspondence / Chief Editor',
        signatoryDesignation: settings.credentials?.signatoryDesignation || 'Editor-in-Chief & Central Secretariat',
        organization: {
          ...ORG_DETAILS,
          credentials: settings.credentials,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/documents/appointment-letter/:userId
// @desc    Get Appointment Letter metadata & details for print/download
router.get('/appointment-letter/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (user.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Application is not approved yet. Appointment letter is generated after approval.',
      });
    }

    const year = new Date(user.appointmentLetterDate || Date.now()).getFullYear();
    const referenceNo = user.appointmentReferenceNo || `SE/APPT/${year}/${user.idCardNumber ? user.idCardNumber.split('-').pop() : '001'}`;
    const settings = await SiteSettings.getSettings();

    res.json({
      success: true,
      appointmentData: {
        referenceNo,
        date: user.appointmentLetterDate || user.updatedAt,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        role: user.role,
        assignedDesignation: user.assignedDesignation,
        committeeLevel: user.committeeLevel,
        assignedLocation: user.assignedLocation,
        idCardNumber: user.idCardNumber,
        validUntil: user.idCardValidUntil,
        officialSeal: settings.credentials?.officialSeal || '',
        presidentSignature: settings.credentials?.presidentSignature || '',
        signatoryName: settings.credentials?.signatoryName || 'Nation Correspondence / Chief Editor',
        signatoryDesignation: settings.credentials?.signatoryDesignation || 'Editor-in-Chief & Central Secretariat',
        organization: {
          ...ORG_DETAILS,
          credentials: settings.credentials,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/documents/verify/:cardNumber
// @desc    Public verification endpoint for scanning the QR code on an ID Card
router.get('/verify/:cardNumber', async (req, res) => {
  try {
    const { cardNumber } = req.params;
    let user = await User.findOne({ idCardNumber: cardNumber }).select(
      'name role assignedDesignation committeeLevel assignedLocation idCardNumber idCardValidUntil status photo appointmentLetterDate'
    );

    // Also check if id is mongo id
    if (!user && cardNumber.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(cardNumber).select(
        'name role assignedDesignation committeeLevel assignedLocation idCardNumber idCardValidUntil status photo appointmentLetterDate'
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'No official credentials or member record found for this identifier.',
      });
    }

    const isExpired = user.idCardValidUntil && new Date(user.idCardValidUntil) < new Date();

    res.json({
      success: true,
      verified: user.status === 'approved',
      status: user.status,
      isExpired,
      member: {
        name: user.name,
        role: user.role,
        assignedDesignation: user.assignedDesignation,
        committeeLevel: user.committeeLevel,
        assignedLocation: user.assignedLocation,
        idCardNumber: user.idCardNumber,
        photo: user.photo,
        issueDate: user.appointmentLetterDate,
        validUntil: user.idCardValidUntil,
      },
      organization: ORG_DETAILS,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
