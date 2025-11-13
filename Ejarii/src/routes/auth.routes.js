const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;