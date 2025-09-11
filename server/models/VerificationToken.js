// server/models/VerificationToken.js
const mongoose = require("mongoose");

const verificationTokenTTL =
  process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN || "15m";
console.log(
  `[DB Setup] VerificationToken TTL Index set to expire after: ${verificationTokenTTL}`
); // Log expiry

const VerificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true, // Important: A user should only have one active verify token
  },
  token: {
    type: String,
    required: true,
    unique: true, // Tokens themselves must be unique across all users
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL index - MongoDB automatically deletes documents after this duration
    // Requires 'createdAt' field to be type Date
    index: { expires: verificationTokenTTL },
  },
});

module.exports = mongoose.model("VerificationToken", VerificationTokenSchema);
