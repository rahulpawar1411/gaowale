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
    const [rows] = await pool.execute(
      'SELECT id, phone, password_hash FROM admins WHERE phone = ?',
      [String(phone).trim()]
    );
    const admin = rows[0];
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    const match = await bcrypt.compare(String(password), admin.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    const token = jwt.sign(
      { id: admin.id, phone: admin.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({
      success: true,
      token,
      admin: { id: admin.id, phone: admin.phone },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const me = async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, admin: { id: req.admin.id, phone: req.admin.phone } });
};

module.exports = { login, me };
