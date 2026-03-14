const { pool } = require('../config/database');

// List all sub-admins under current super admin
const listSubAdmins = async (req, res) => {
  try {
    const adminId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT id, name, phone, created_at FROM sub_admins WHERE admin_id = ? ORDER BY id DESC',
      [adminId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listSubAdmins error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load sub admins' });
  }
};

// Create a new sub-admin under current super admin
const createSubAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, phone, password } = req.body || {};
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone and password are required',
      });
    }
    if (String(password).length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long',
      });
    }

    const trimmedPhone = String(phone).trim();
    const [existing] = await pool.execute(
      'SELECT id FROM sub_admins WHERE phone = ?',
      [trimmedPhone]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Sub admin with this phone already exists',
      });
    }

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(String(password), 10);
    const [result] = await pool.execute(
      'INSERT INTO sub_admins (admin_id, name, phone, password_hash) VALUES (?, ?, ?, ?)',
      [adminId, String(name).trim(), trimmedPhone, passwordHash]
    );

    const [rows] = await pool.execute(
      'SELECT id, name, phone, created_at FROM sub_admins WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createSubAdmin error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create sub admin' });
  }
};

// Get permissions (paths) for a given sub admin (must belong to current admin)
const getSubAdminPermissions = async (req, res) => {
  try {
    const adminId = req.user.id;
    const subAdminId = Number(req.params.id);
    if (!subAdminId) {
      return res.status(400).json({ success: false, message: 'Invalid sub admin id' });
    }
    const [rows] = await pool.execute(
      'SELECT id FROM sub_admins WHERE id = ? AND admin_id = ?',
      [subAdminId, adminId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sub admin not found' });
    }

    const [permRows] = await pool.execute(
      'SELECT path FROM sub_admin_permissions WHERE sub_admin_id = ?',
      [subAdminId]
    );
    res.json({
      success: true,
      data: permRows.map((r) => r.path),
    });
  } catch (err) {
    console.error('getSubAdminPermissions error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load permissions' });
  }
};

// Replace permissions for a sub admin
const updateSubAdminPermissions = async (req, res) => {
  try {
    const adminId = req.user.id;
    const subAdminId = Number(req.params.id);
    const { paths } = req.body || {};

    if (!subAdminId) {
      return res.status(400).json({ success: false, message: 'Invalid sub admin id' });
    }
    if (!Array.isArray(paths)) {
      return res.status(400).json({ success: false, message: 'paths must be an array' });
    }

    const [rows] = await pool.execute(
      'SELECT id FROM sub_admins WHERE id = ? AND admin_id = ?',
      [subAdminId, adminId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sub admin not found' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute('DELETE FROM sub_admin_permissions WHERE sub_admin_id = ?', [subAdminId]);
      const uniquePaths = Array.from(
        new Set(
          paths
            .map((p) => String(p || '').trim())
            .filter((p) => p.length > 0)
        )
      );
      if (uniquePaths.length > 0) {
        const values = uniquePaths.map((p) => [subAdminId, p]);
        await conn.query(
          'INSERT INTO sub_admin_permissions (sub_admin_id, path) VALUES ?',
          [values]
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('updateSubAdminPermissions error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update permissions' });
  }
};

// Permissions for currently logged-in sub admin
const myPermissions = async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'sub-admin') {
      return res.json({ success: true, data: null });
    }
    const subAdminId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT path FROM sub_admin_permissions WHERE sub_admin_id = ?',
      [subAdminId]
    );
    res.json({
      success: true,
      data: rows.map((r) => r.path),
    });
  } catch (err) {
    console.error('myPermissions error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load permissions' });
  }
};

// Delete a sub admin belonging to current admin
const deleteSubAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const subAdminId = Number(req.params.id);
    if (!subAdminId) {
      return res.status(400).json({ success: false, message: 'Invalid sub admin id' });
    }
    const [rows] = await pool.execute(
      'SELECT id FROM sub_admins WHERE id = ? AND admin_id = ?',
      [subAdminId, adminId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sub admin not found' });
    }
    await pool.execute('DELETE FROM sub_admins WHERE id = ?', [subAdminId]);
    // sub_admin_permissions rows will be removed automatically via ON DELETE CASCADE
    res.json({ success: true });
  } catch (err) {
    console.error('deleteSubAdmin error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete sub admin' });
  }
};

module.exports = {
  listSubAdmins,
  createSubAdmin,
  getSubAdminPermissions,
  updateSubAdminPermissions,
  myPermissions,
  deleteSubAdmin,
};

