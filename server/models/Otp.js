// server/models/Otp.js
const mongoose = require('mongoose');

const otpTTL = process.env.PASSWORD_RESET_OTP_EXPIRES_IN || '5m'; // OTPs should be short-lived
console.log(`[DB Setup] Password Reset OTP TTL Index set to expire after: ${otpTTL}`);

const OtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    otp: { // The 4 or 6 digit code
        type: String,
        required: true,
    },
    // No need for 'unique' on userId here, as user might request multiple OTPs if first expires.
    // But maybe add logic to invalidate previous OTPs for the same user on new request.
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: otpTTL } // Automatically delete after 5-15 minutes
    }
});

module.exports = mongoose.model('Otp', OtpSchema);