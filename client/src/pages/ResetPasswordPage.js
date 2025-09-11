// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import LockResetIcon from '@mui/icons-material/LockReset'; // Icon for reset

import { resetPasswordWithTokenAPI } from '../api/auth';

const ResetPasswordPage = () => {
    const { token } = useParams(); // Get the token from URL parameter
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!password || password.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
             setError('Invalid password reset link. Token is missing. Please request a new link.');
             return;
        }

        setIsSubmitting(true);
        try {
            const response = await resetPasswordWithTokenAPI(token, { password });
            if (response && response.success) {
                setSuccessMessage(response.message || 'Password has been reset successfully! Redirecting to login...');
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => navigate('/login'), 3000); // Redirect after 3s
            } else {
                setError(response?.message || 'Failed to reset password. The link may be invalid or expired.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again or request a new link.');
            console.error("Reset password error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: {xs:2, sm:4}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <LockResetIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography component="h1" variant="h5" gutterBottom>
                    Set New Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                    Please enter and confirm your new password below.
                </Typography>

                {error && !successMessage && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{successMessage}</Alert>}

                {/* Show form only if no success message to prevent re-submit */}
                {!successMessage && (
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="New Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            error={!!error && (!password || password.length < 6)}
                            helperText="Minimum 6 characters"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSubmitting}
                            error={!!error && (password !== confirmPassword || !confirmPassword)}
                            helperText={!!error && password !== confirmPassword && !confirmPassword ? "Passwords do not match" : ""}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py:1.2 }}
                            disabled={isSubmitting || !token}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Reset Password'}
                        </Button>
                    </Box>
                )}
                 {successMessage && (
                    <Button fullWidth variant="outlined" component={RouterLink} to="/login" sx={{mt:2}}>Go to Login</Button>
                 )}
            </Paper>
        </Container>
    );
};

export default ResetPasswordPage;