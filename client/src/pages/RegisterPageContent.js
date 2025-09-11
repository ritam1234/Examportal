// src/pages/RegisterPageContent.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert"; // Make sure Alert is imported
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import useAuth from "../hooks/useAuth";
// No need for useNavigate directly in this component for registration flow anymore

const RegisterPageContent = ({ onFlip }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For success/info
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth(); // register function from AuthContext

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    // --- Client-Side Validation ---
    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email Address is required.");
      return;
    }
    // Simple email regex (consider a library for more robust validation)
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      // The register function in AuthContext now directly returns the backend response
      // It expects { success: true, message: "..." } or throws an error
      const response = await register(name.trim(), email.trim(), password);

      if (response && response.success) {
        setSuccessMessage(
          response.message ||
            "Registration complete! Please check your email for a verification link."
        );
        // Optionally clear form fields after successful submission indication
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        // This case might be less common if AuthContext's register throws error on success:false
        setError(response?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      // Error caught from AuthContext's register function (which re-threw it)
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed due to an unexpected error."
      );
      console.error("Register Page Submit Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        {" "}
        <LockOutlinedIcon />{" "}
      </Avatar>
      <Typography
        component="h1"
        variant="h5"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        {" "}
        Sign up{" "}
      </Typography>

      {/* Error Alert */}
      {error && !successMessage && (
        <Alert
          severity="error"
          sx={{ width: "100%", mb: 2 }}
          onClose={() => setError("")}
        >
          {" "}
          {error}{" "}
        </Alert>
      )}
      {/* Success/Info Alert (from backend response) */}
      {successMessage && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          sx={{ width: "100%", mb: 2 }}
        >
          {successMessage}
        </Alert>
      )}

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{ mt: 1, width: "100%" }}
      >
        <TextField
          margin="normal"
          autoComplete="name"
          name="name"
          required
          fullWidth
          id="name"
          label="Full Name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          error={!!error && !name.trim() && !successMessage}
          helperText={
            !!error && !name.trim() && !successMessage
              ? "Full Name is required"
              : ""
          }
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          error={
            !!error &&
            (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) &&
            !successMessage
          }
          helperText={
            !!error && !email.trim() && !successMessage
              ? "Valid Email is required"
              : ""
          }
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="Minimum 6 characters"
          FormHelperTextProps={{ sx: { ml: 0 } }}
          disabled={isSubmitting}
          error={
            !!error && (!password || password.length < 6) && !successMessage
          }
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting}
          error={
            !!error &&
            (password !== confirmPassword || !confirmPassword) &&
            !successMessage
          }
          helperText={
            !!error && password !== confirmPassword && !successMessage
              ? "Passwords do not match"
              : ""
          }
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: "bold" }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create Account"
          )}
        </Button>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={onFlip}
              variant="body2"
              sx={{ fontWeight: "medium" }}
            >
              {" "}
              Sign in{" "}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

RegisterPageContent.propTypes = { onFlip: PropTypes.func.isRequired };
export default RegisterPageContent;
