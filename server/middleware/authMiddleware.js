const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gao-admin-secret-change-in-production';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded: { id, phone, role, type }
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      role: decoded.role || null,
      type: decoded.type || 'admin',
      adminId: decoded.adminId || null,
    };
    if (req.user.type === 'admin') {
      req.admin = { id: req.user.id, phone: req.user.phone };
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  const u = req.user;
  if (!u || u.type !== 'admin' || (u.phone !== '1234567890' && u.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  return next();
};

module.exports = { authenticate, requireSuperAdmin };
