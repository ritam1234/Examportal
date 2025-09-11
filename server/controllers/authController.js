// server/controllers/authController.js
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const Otp = require("../models/Otp"); // Ensure this model exists if using its features
const PasswordResetToken = require("../models/PasswordResetToken"); // Ensure this model exists if using its features
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
require("dotenv").config();

class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.verifyAccount = this.verifyAccount.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.verifyPasswordResetOtp = this.verifyPasswordResetOtp.bind(this);
    this.resetPasswordWithToken = this.resetPasswordWithToken.bind(this);
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "30d", // Or your preferred duration
    });
  }

  // --- REGISTER USER & SEND VERIFICATION EMAIL ---
  async register(req, res) {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[API Register] Request for:", normalizedEmail);

    if (!name || !normalizedEmail || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required.",
        });
    }

    let newUser = null;

    try {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        if (!userExists.isVerified) {
          console.warn(
            `[API Register] Account ${normalizedEmail} exists but is not verified. Re-register attempt.`
          );
          // Option: If desired, you could resend the verification email here instead of erroring.
          // For now, erroring is simpler to avoid abuse if verification email system has issues.
          return res
            .status(400)
            .json({
              success: false,
              message:
                "An account with this email exists but has not been verified. Please check your original verification email or contact support.",
            });
        }
        console.warn(
          `[API Register] Attempt for existing verified email: ${normalizedEmail}`
        );
        return res
          .status(400)
          .json({
            success: false,
            message:
              "An account with this email is already registered and verified.",
          });
      }

      newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password, // Hashing happens in User model pre-save hook
        role: role && ["admin", "student"].includes(role) ? role : "student",
        // isVerified defaults to false in User model
      });
      console.log(
        `[DB] User ${newUser._id} created (Verified: ${newUser.isVerified}) for email ${normalizedEmail}`
      );

      // Generate and Store Verification Token
      const verifyToken = crypto.randomBytes(32).toString("hex");
      // Ensure atomicity: delete old and create new for this user
      await VerificationToken.findOneAndDelete({ userId: newUser._id });
      await VerificationToken.create({
        userId: newUser._id,
        token: verifyToken,
      });
      console.log(`[DB] Verification token stored for user ${newUser._id}`);

      // Prepare & Send Email
      const verificationUrl = `${process.env.BACKEND_API_URL}/auth/verify/${newUser._id}/${verifyToken}`;
      const emailHtml = `
          <h2>Welcome to Your Exam Portal!</h2>
          <p>Thanks for registering. Please click the link below to activate your account:</p>
          <p style="margin: 20px 0;">
              <a href="${verificationUrl}" target="_blank" style="background-color: #1976d2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify My Email Address</a>
          </p>
          <p>This link is valid for ${
            process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN || "1h"
          }.</p>
          <p>If you didn't register, please ignore this email.</p>
          <hr>
          <p><small>If the button doesn't work, copy/paste this link: ${verificationUrl}</small></p>
      `;

      console.log(
        `[Register] Attempting verification email send to ${newUser.email}`
      );
      await sendEmail({
        email: newUser.email,
        subject: "Action Required: Verify Your Exam Portal Account",
        html: emailHtml,
      });
      console.log(
        `[Register] Email send attempt completed for ${newUser.email}. Check server logs for sendEmail utility outcome.`
      );

      res.status(201).json({
        success: true,
        message: `Registration successful! A verification email has been sent to ${newUser.email}. Please check your inbox (and spam folder).`,
      });
    } catch (error) {
      console.error(
        "[API Register] CRITICAL ERROR during registration:",
        error
      );
      // Rollback user creation if email sending critically fails AND user was created
      // Only attempt rollback if newUser object exists (meaning user was created)
      // and if it's an email-specific error (sendEmail utility throws descriptive error)
      if (newUser && error.message?.includes("Failed to send email")) {
        console.error(
          `[API Register] User ${newUser._id} was created, but verification email FAILED. NOT rolling back user. Message: ${error.message}`
        );
        // Don't delete the user - inform frontend. User can contact support or retry if there's a resend option later.
        return res.status(502).json({
          // 502 Bad Gateway: Problem with an upstream service (email)
          success: false, // Overall, verification part failed
          message: `User registered, BUT the verification email could not be sent due to: ${error.message}. Please contact support.`,
          userId: newUser._id, // So support can find the user
        });
      } else if (newUser && error.code !== 11000) {
        // General error if user created but not email or duplicate
        console.log(
          `[Rollback] Deleting user ${newUser._id} and their verification tokens due to registration error.`
        );
        await User.findByIdAndDelete(newUser._id).catch((err) =>
          console.error("Rollback delete user failed:", err)
        );
        await VerificationToken.deleteMany({ userId: newUser._id }).catch(
          (err) =>
            console.error("Rollback delete verification token failed:", err)
        );
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((e) => e.message)
          .join(". ");
        return res.status(400).json({ success: false, message: messages });
      }
      // General fallback
      res
        .status(500)
        .json({
          success: false,
          message: error.message || "Server error during registration.",
        });
    }
  }

  // --- VERIFY ACCOUNT VIA LINK (Robust Version) ---
  async verifyAccount(req, res) {
    const { userId, token } = req.params;
    console.log(
      `[API Verify] Link Clicked - UserID: ${userId}, Token: ${
        token ? "present" : "hidden_for_log"
      }`
    );

    const successUrl = `${process.env.FRONTEND_URL}/email-verified?success=true`;
    const failInvalidUrl = `${process.env.FRONTEND_URL}/email-verified?success=false&reason=invalid_link`;
    const failAlreadyVerifiedUrl = `${process.env.FRONTEND_URL}/email-verified?success=true&reason=already_verified`;
    const failUserNotFoundUrl = `${process.env.FRONTEND_URL}/email-verified?success=false&reason=user_not_found`;
    const failServerErrorUrl = `${process.env.FRONTEND_URL}/email-verified?success=false&reason=server_error`;

    try {
      if (!userId || !token || !mongoose.Types.ObjectId.isValid(userId)) {
        console.warn(
          "[API Verify] Invalid UserID or missing Token in request."
        );
        return res.redirect(failInvalidUrl);
      }

      // 1. Find User by ID
      // Fetch the full Mongoose document because we need to call user.save()
      const user = await User.findById(userId);

      if (!user) {
        console.warn(
          `[DB Verify] User ${userId} not found during verification process.`
        );
        return res.redirect(failUserNotFoundUrl); // More specific reason for frontend
      }
      console.log(
        `[DB Verify] User ${userId} found. Current isVerified: ${user.isVerified}`
      );

      if (user.isVerified) {
        console.log(
          `[Logic Verify] User ${userId} is already verified. Attempting token cleanup.`
        );
        // Best effort: if token still exists for an already verified user, clean it up.
        await VerificationToken.deleteOne({ userId: userId, token: token });
        return res.redirect(failAlreadyVerifiedUrl);
      }

      // 2. Find and atomically remove the Verification Token matching both userId and token
      console.log(
        `[DB Verify] Searching for AND DELETING verification token for User: ${userId}`
      );
      const verificationTokenDoc = await VerificationToken.findOneAndDelete({
        userId: userId,
        token: token,
      });

      if (!verificationTokenDoc) {
        // Token not found, OR expired and deleted by TTL, OR token didn't match the one in DB for this user.
        console.warn(
          `[DB Verify] Verification token NOT FOUND or EXPIRED for User ${userId}. User's current verified status: ${user.isVerified}`
        );
        return res.redirect(failInvalidUrl);
      }
      console.log(
        `[DB Verify] Valid verification token found and deleted for User ${userId}. Token was: ${verificationTokenDoc.token.substring(
          0,
          5
        )}...`
      );

      // 3. Token was valid - Mark User as Verified AND Save
      console.log(
        `[DB Verify] Setting isVerified=true for User ${userId} (${user.email})...`
      );
      user.isVerified = true;
      const savedUser = await user.save(); // This line saves the change to the database.

      // 4. Double check if save was successful
      if (!savedUser || !savedUser.isVerified) {
        console.error(
          `[DB Verify] CRITICAL ERROR: User ${userId} save FAILED or isVerified is still false AFTER save!`
        );
        // This is a server-side problem. User will be redirected to a server error page.
        return res.redirect(failServerErrorUrl);
      }

      console.log(
        `[API Verify] SUCCESS - User ${userId} (${savedUser.email}) is NOW verified. Redirecting...`
      );
      res.redirect(successUrl);
    } catch (error) {
      console.error(
        "[API Verify] Unhandled Server Error during email verification:",
        error
      );
      res.redirect(failServerErrorUrl);
    }
  }

  // --- LOGIN (With Admin Bypass for Verification) ---
  async login(req, res) {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[API Login] Attempt for:", normalizedEmail);

    if (!normalizedEmail || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    try {
      const user = await User.findOne({ email: normalizedEmail }).select(
        "+password"
      );
      if (!user) {
        console.warn(`[API Login] User not found: ${normalizedEmail}`);
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password." }); // Generic message
      }

      // --- Admin Login & Verification Check ---
      if (user.role === "admin") {
        console.log(
          `[API Login] Admin user ${normalizedEmail} logging in. Verification status: ${user.isVerified}.`
        );
        // Admin can login even if not verified, but log a warning if so.
        if (!user.isVerified) {
          console.warn(
            `[API Login] SECURITY ADVISORY: Admin ${normalizedEmail} is logging in without a verified email.`
          );
        }
      } else {
        // For non-admin users (students)
        if (!user.isVerified) {
          console.warn(
            `[API Login] STUDENT account ${normalizedEmail} not verified. Login denied.`
          );
          return res
            .status(401)
            .json({
              success: false,
              message:
                "Account not verified. Please check your email for a verification link.",
            });
        }
      }
      // ------------------------------------

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        console.warn(`[API Login] Incorrect password for ${normalizedEmail}`);
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password." }); // Generic message
      }

      console.log(
        `[API Login] Successful login for ${normalizedEmail} (Role: ${user.role})`
      );
      const token = this.generateToken(user._id);
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          // Send back essential user info
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      });
    } catch (error) {
      console.error("[API Login] Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: error.message || "Server error during login",
        });
    }
  }

  // --- GET PROFILE ---
  async getProfile(req, res) {
    // req.user comes from protect middleware
    if (req.user) {
      res.status(200).json({
        success: true,
        user: {
          // Return specific fields, ensure isVerified is included
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isVerified: req.user.isVerified, // Essential for frontend logic
        },
      });
    } else {
      // This case should ideally be caught by 'protect' if token is invalid/missing
      res
        .status(404)
        .json({ success: false, message: "User not found or token issue." });
    }
  }

  // --- REQUEST PASSWORD RESET (Complete from Previous) ---
  async requestPasswordReset(req, res) {
    /* ... (Keep the complete, robust version) ... */
  }

  // --- VERIFY PASSWORD RESET OTP (Complete from Previous) ---
  async verifyPasswordResetOtp(req, res) {
    /* ... (Keep the complete, robust version) ... */
  }

  // --- RESET PASSWORD WITH TOKEN (Complete from Previous) ---
  async resetPasswordWithToken(req, res) {
    /* ... (Keep the complete, robust version) ... */
  }
} // end AuthController

module.exports = new AuthController();
