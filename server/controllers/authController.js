const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gao-admin-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const login = async (req, res) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }
    if (String(password).length < 4) {
      return res
        .status(400)
        .json({ success: false, message: 'Password must be at least 4 characters long' });
    }
    const trimmedPhone = String(phone).trim();

    // 1) Try main admins table
    let [rows] = await pool.execute(
      'SELECT id, phone, password_hash FROM admins WHERE phone = ?',
      [trimmedPhone]
    );
    let userRow = rows[0];
    let userType = null;

    if (userRow) {
      userType = 'admin';
    } else {
      // 2) Try sub_admins if not found in admins
      [rows] = await pool.execute(
        'SELECT id, admin_id, name, phone, password_hash FROM sub_admins WHERE phone = ?',
        [trimmedPhone]
      );
      userRow = rows[0];
      if (userRow) {
        userType = 'sub-admin';
      }
    }

    if (!userRow) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const match = await bcrypt.compare(String(password), userRow.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const payload =
      userType === 'admin'
        ? {
            id: userRow.id,
            phone: userRow.phone,
            type: 'admin',
            role: userRow.phone === '1234567890' ? 'SUPER_ADMIN' : 'ADMIN',
          }
        : {
            id: userRow.id,
            phone: userRow.phone,
            type: 'sub-admin',
            adminId: userRow.admin_id,
            name: userRow.name || null,
          };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      token,
      admin: payload,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, admin: req.user });
};

// Extra verification for sensitive pages (like Authorization).
// Requires current JWT to belong to the same admin whose phone is provided,
// and the password must match the admins table.
const verifyAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }
    if (String(password).length < 4) {
      return res
        .status(400)
        .json({ success: false, message: 'Password must be at least 4 characters long' });
    }
    const trimmedPhone = String(phone).trim();

    const [rows] = await pool.execute(
      'SELECT id, phone, password_hash FROM admins WHERE phone = ?',
      [trimmedPhone]
    );
    const adminRow = rows[0];
    if (!adminRow) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    // Ensure the verified admin is the same as the logged-in admin
    if (adminRow.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Admin mismatch' });
    }

    const match = await bcrypt.compare(String(password), adminRow.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('verifyAdmin error:', err.message);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

module.exports = { login, me, verifyAdmin };
