// server/utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Make sure env vars are available

const sendEmail = async (options) => {
  // --- 1. Input Validation & Configuration Check ---
  console.log("[Email Util] Preparing to send email...");
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.error(
      "[Email Util] CRITICAL ERROR: Missing required email environment variables (HOST, PORT, USER, PASS). Cannot send email."
    );
    throw new Error("Email service is not configured correctly on the server."); // Throw error immediately
  }
  if (!options.email || !options.subject || !options.html) {
    console.error(
      "[Email Util] ERROR: Missing required options for sending email (email, subject, html)."
    );
    throw new Error(
      "Internal error: Missing required information to send email."
    );
  }

  const transporterOptions = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10), // Ensure it's a number
    secure: process.env.EMAIL_SECURE === "true", // Correct boolean conversion
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Uncomment for detailed SMTP debugging if needed, then restart server
    // logger: true,
    // debug: true,
  };

  // --- 2. Create Transporter ---
  console.log(
    `[Email Util] Creating transporter for host: ${transporterOptions.host}`
  );
  const transporter = nodemailer.createTransport(transporterOptions);

  // --- 3. Define Email Options ---
  const mailOptions = {
    from:
      process.env.EMAIL_FROM_ADDRESS ||
      '"Exam Portal App" <no-reply@example.com>', // Use configured sender or fallback
    to: options.email, // Recipient from function argument
    subject: options.subject, // Subject from function argument
    html: options.html, // HTML content from function argument
  };

  console.log(
    `[Email Util] Attempting to send email via Nodemailer - To: ${options.email}, Subject: ${options.subject}`
  );

  // --- 4. Send Email & Handle Response ---
  try {
    console.log("[Email Util] Calling transporter.sendMail...");
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[Email Util] SUCCESS - Email sent to ${options.email}. Message ID: ${info.messageId}`
    );
    console.log(`[Email Util] Server Response: ${info.response}`); // Log server confirmation

    return { success: true, info }; // Indicate success and return mail info
  } catch (error) {
    console.error("[Email Util] ***** NODEMAILER SENDMAIL FAILED *****");
    // Log detailed SMTP error information
    console.error(`   Error Code: ${error.code}`); // e.g., 'EAUTH', 'ECONNECTION'
    console.error(`   Error Command: ${error.command}`); // e.g., 'CONN', 'AUTH', 'MAIL FROM'
    console.error(`   Error Message: ${error.message}`);
    // Throw a clear error for the calling function (authController) to handle
    throw new Error(
      `Email sending failed - ${error.message} (Code: ${error.code || "N/A"})`
    );
  }
};

module.exports = sendEmail;
