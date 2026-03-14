const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireSuperAdmin } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
// Extra verification for sensitive admin pages (e.g., Authorization)
router.post('/verify-admin', authenticate, requireSuperAdmin, authController.verifyAdmin);

module.exports = router;
