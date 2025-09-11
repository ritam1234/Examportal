// src/pages/RequestPasswordResetPage.js
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key'; // Icon for reset

// Import the API call function (create this in api/auth.js)
import { requestPasswordResetAPI } from '../api/auth'; // Adjust path if needed

const RequestPasswordResetPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await requestPasswordResetAPI({ email }); // API function expects an object
            if (response && response.success) {
                setSuccessMessage(response.message || 'If an account with this email exists, an OTP has been sent.');
                setEmail(''); // Clear email field on success
                // Optionally redirect to OTP page automatically after a delay or keep user here
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
            } else {
                setError(response?.message || 'Failed to request password reset.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
            console.error("Request password reset error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: {xs: 2, sm:4}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <KeyIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography component="h1" variant="h5" gutterBottom>
                    Forgot Your Password?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                    No worries! Enter your email address below, and we'll send you an OTP to reset your password.
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        error={!!error && !email.trim()}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.2 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Send OTP'}
                    </Button>
                    <Button
                        fullWidth
                        variant="text"
                        component={RouterLink}
                        to="/login"
                        startIcon={<ArrowBackIcon />}
                    >
                        Back to Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default RequestPasswordResetPage;