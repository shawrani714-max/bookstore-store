const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const logger = require('../utils/logger');

// Middleware to protect admin routes
module.exports = async function protectAdmin(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  logger.debug('Admin auth check', {
    hasToken: !!token,
    url: req.url,
    method: req.method
  });

  if (!token) {
    logger.warn('Admin authentication failed: No token provided', { url: req.url });
    return res.status(401).json({ success: false, message: 'Not authorized as admin' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug('Token decoded successfully', { id: decoded.id, role: decoded.role });
    
    const admin = await Admin.findById(decoded.id);
    logger.debug('Admin lookup result', { 
      exists: !!admin, 
      isActive: admin?.isActive,
      email: admin?.email 
    });
    
    if (!admin || !admin.isActive) {
      logger.warn('Admin authentication failed: Admin not found or inactive', { 
        adminId: decoded.id,
        exists: !!admin,
        isActive: admin?.isActive 
      });
      return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
    }
    
    logger.info('Admin authentication successful', { 
      adminId: admin._id, 
      email: admin.email, 
      role: admin.role,
      url: req.url 
    });
    req.admin = admin;
    next();
  } catch (err) {
    logger.error('Admin authentication failed: Token verification error', { 
      error: err.message,
      url: req.url 
    });
    return res.status(401).json({ success: false, message: 'Token failed or expired' });
  }
}