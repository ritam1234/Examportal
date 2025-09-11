// server/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// --- Registration & Account Verification ---
router.post('/register', authController.register);
router.get('/verify/:userId/:token', authController.verifyAccount); // Link click for verification

// --- Login & Profile ---
router.post('/login', authController.login);
router.get('/profile', authMiddleware.protect, authController.getProfile);

// --- Password Reset Flow ---
router.post('/request-password-reset', authController.requestPasswordReset);    // Step 1: User requests OTP
router.post('/verify-password-reset-otp', authController.verifyPasswordResetOtp); // Step 2: User submits OTP, gets link token
router.post('/reset-password/:token', authController.resetPasswordWithToken);  // Step 3: User submits new password with link token

module.exports = router;