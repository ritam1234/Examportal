// server/models/PasswordResetToken.js
const mongoose = require('mongoose');

const passwordResetTokenTTL = process.env.PASSWORD_RESET_LINK_EXPIRES_IN || '1h';
console.log(`[DB Setup] PasswordResetToken TTL Index set to expire after: ${passwordResetTokenTTL}`);

const PasswordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true, // One active password reset link token per user
    },
    token: { // The secure random string for the link
        type: String,
        required: true,
        unique: true,
    },
    isOtpVerified: { // New flag: Link can only be used AFTER OTP verification
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: passwordResetTokenTTL }
    }
});

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);