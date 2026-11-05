const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seemanchal_express_super_secret_jwt_key_2026_secured');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token validation failed or expired' });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource`,
      });
    }

    // Admin always has unrestricted access
    if (req.user.role === 'admin') {
      return next();
    }

    // Reporter rejection & suspension check
    if (req.user.role === 'reporter') {
      const isRejected =
        req.user.reporterStatus === 'rejected' || req.user.status === 'rejected';
      if (isRejected) {
        return res.status(403).json({
          success: false,
          isRejected: true,
          message: `Your reporter application has been rejected by administration. Reason: ${req.user.rejectionReason || 'Criteria not met'}. Access and actions are denied.`,
        });
      }

      const isSuspended =
        req.user.reporterStatus === 'suspended' || req.user.status === 'suspended';
      if (isSuspended) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: `Your reporter account is suspended. Reason: ${req.user.suspensionReason || 'Administrative review'}. New news submissions and panel features are restricted.`,
        });
      }
    }

    // Member rejection, suspension & expiry check
    if (req.user.role === 'member') {
      const isRejected =
        req.user.membershipStatus === 'rejected' || req.user.status === 'rejected';
      if (isRejected) {
        return res.status(403).json({
          success: false,
          isRejected: true,
          message: `Your membership application has been rejected by administration. Reason: ${req.user.rejectionReason || 'Criteria not met'}. Access and actions are denied.`,
        });
      }

      // Dynamic backend expiry validation
      if (
        req.user.membershipExpiryDate &&
        new Date(req.user.membershipExpiryDate) < new Date() &&
        req.user.membershipStatus !== 'expired'
      ) {
        req.user.membershipStatus = 'expired';
        await req.user.save().catch(() => {});
      }

      if (req.user.membershipStatus === 'suspended' || req.user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: `Your membership has been suspended. Reason: ${req.user.suspensionReason || 'Administrative review'}.`,
        });
      }

      if (req.user.membershipStatus === 'expired') {
        return res.status(403).json({
          success: false,
          isExpired: true,
          message: 'Your membership has expired. Please contact admin for membership renewal.',
        });
      }
    }

    next();
  };
};

module.exports = { protect, authorize };
