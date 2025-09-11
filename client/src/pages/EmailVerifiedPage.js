import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const EmailVerifiedPage = () => {
    const [searchParams] = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState({
        success: null,
        message: 'Processing verification...',
        reason: null,
    });

    useEffect(() => {
        const success = searchParams.get('success');
        const reason = searchParams.get('reason');

        if (success === 'true') {
            if (reason === 'already_verified') {
                setVerificationStatus({
                    success: true,
                    message: 'Your email address has already been verified.',
                    reason: 'already_verified',
                });
            } else {
                setVerificationStatus({
                    success: true,
                    message: 'Your email address has been successfully verified!',
                    reason: 'verified',
                });
            }
        } else if (success === 'false') {
            let failMessage = 'Email verification failed.';
            if (reason === 'invalid') {
                failMessage = 'The verification link is invalid or has expired. Please try registering again or request a new link if applicable.';
            } else if (reason === 'server_error') {
                failMessage = 'A server error occurred during verification. Please try again later or contact support.';
            }
            setVerificationStatus({ success: false, message: failMessage, reason });
        } else {
            // Default to failure if query params are missing or unexpected
            setVerificationStatus({ success: false, message: 'Verification link is invalid or has expired.', reason: 'unknown' });
        }
    }, [searchParams]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: {xs:2, sm:4} }}>
                {verificationStatus.success === null && (
                    <Typography variant="h5">Verifying your email...</Typography>
                    // Optional: Add a spinner here
                )}

                {verificationStatus.success === true && (
                    <Box>
                        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ color: 'success.main' }}>
                            Verification Confirmed!
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {verificationStatus.message}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            component={RouterLink}
                            to="/login" // Link to login page
                        >
                            Proceed to Login
                        </Button>
                    </Box>
                )}

                {verificationStatus.success === false && (
                    <Box>
                        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ color: 'error.main' }}>
                            Verification Failed
                        </Typography>
                        <Alert severity="error" sx={{ textAlign: 'left', mb: 3 }}>
                            <AlertTitle>Error</AlertTitle>
                            {verificationStatus.message}
                        </Alert>
                        <Button
                            variant="outlined"
                            color="primary"
                            component={RouterLink}
                            to="/register" // Link back to register
                            sx={{mr: 1}}
                        >
                            Try Registration Again
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            component={RouterLink}
                            to="/" // Link to homepage
                        >
                            Go to Homepage
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default EmailVerifiedPage;