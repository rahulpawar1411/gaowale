const express = require('express');
const router = express.Router();
const {
  listSubAdmins,
  createSubAdmin,
  getSubAdminPermissions,
  updateSubAdminPermissions,
  myPermissions,
} = require('../controllers/authorizationController');
const { requireSuperAdmin } = require('../middleware/authMiddleware');

// Admin-only management of sub admins and their permissions
router.get('/sub-admins', requireSuperAdmin, listSubAdmins);
router.post('/sub-admins', requireSuperAdmin, createSubAdmin);
router.get('/sub-admins/:id/permissions', requireSuperAdmin, getSubAdminPermissions);
router.put('/sub-admins/:id/permissions', requireSuperAdmin, updateSubAdminPermissions);
router.delete('/sub-admins/:id', requireSuperAdmin, require('../controllers/authorizationController').deleteSubAdmin);

// For any authenticated user; returns null or list of allowed paths
router.get('/my-permissions', myPermissions);

module.exports = router;

