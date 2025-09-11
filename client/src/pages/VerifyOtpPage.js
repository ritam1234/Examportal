// src/pages/VerifyOtpPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';

import { verifyPasswordResetOtpAPI } from '../api/auth';

const VerifyOtpPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const emailFromQuery = searchParams.get('email');
        if (emailFromQuery) {
            setEmail(decodeURIComponent(emailFromQuery));
        }
    }, [searchParams]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (!otp.trim() || otp.trim().length !== (parseInt(process.env.REACT_APP_OTP_LENGTH || '6'))) { // Assuming OTP length env var for frontend too
            setError(`Please enter a valid ${process.env.REACT_APP_OTP_LENGTH || '6'}-digit OTP.`);
            return;
        }
        if (!email) {
            setError('Email is missing. Please go back and request OTP again.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await verifyPasswordResetOtpAPI({ email, otp });
            if (response && response.success && response.resetToken) {
                // OTP Verified! Navigate to the Reset Password page with the token
                navigate(`/reset-password/${response.resetToken}`);
            } else {
                setError(response?.message || 'OTP verification failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during OTP verification.');
            console.error("Verify OTP error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: {xs:2, sm:4}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <EnhancedEncryptionIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography component="h1" variant="h5" gutterBottom>
                    Verify OTP
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                    An OTP has been sent to {email || 'your email'}. Please enter it below.
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                    <TextField
                        margin="normal"
                        fullWidth
                        id="email_display"
                        label="Email"
                        value={email}
                        disabled // Display only, not editable here
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="otp"
                        label="One-Time Password (OTP)"
                        name="otp"
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} // Allow only digits, max 6
                        inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
                        disabled={isSubmitting}
                        error={!!error && !otp.trim()}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.2 }}
                        disabled={isSubmitting || !email}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Verify OTP & Proceed'}
                    </Button>
                     <Typography variant="body2" sx={{textAlign:'center'}}>
                        Didn't receive OTP?{' '}
                         <Link component={RouterLink} to="/request-password-reset">Request again</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default VerifyOtpPage;