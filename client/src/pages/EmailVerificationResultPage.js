// src/pages/EmailVerificationResultPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';

const EmailVerificationResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failed', 'already_verified'
    const [reason, setReason] = useState('');

    useEffect(() => {
        const successParam = searchParams.get('success');
        const reasonParam = searchParams.get('reason');

        if (successParam === 'true') {
             if(reasonParam === 'already_verified'){
                  setStatus('already_verified');
              } else {
                 setStatus('success');
                 // Optionally redirect to login after a short delay
                 setTimeout(() => navigate('/login'), 4000);
             }
         } else if (successParam === 'false') {
            setStatus('failed');
             if (reasonParam === 'invalid') {
                 setReason('Invalid or expired verification link.');
             } else if (reasonParam === 'server_error') {
                  setReason('An unexpected server error occurred. Please try again later or contact support.');
              } else {
                  setReason('Verification failed. Please try registering again or contact support.');
             }
        } else {
             // No valid params, treat as invalid access? Or maybe came directly without redirect
            setStatus('failed');
             setReason('Invalid verification request.');
        }
    }, [searchParams, navigate]);

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                     <>
                         <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                         <Typography variant="h5" gutterBottom>Email Verified!</Typography>
                         <Typography color="text.secondary">Your account is now active. You will be redirected to the login page shortly.</Typography>
                         <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 3 }}>Login Now</Button>
                     </>
                );
            case 'already_verified':
                return (
                     <>
                         <CheckCircleOutlineIcon color="info" sx={{ fontSize: 60, mb: 2 }} />
                         <Typography variant="h5" gutterBottom>Already Verified</Typography>
                         <Typography color="text.secondary">This email address has already been verified. You can log in.</Typography>
                         <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 3 }}>Login Now</Button>
                     </>
                 );
            case 'failed':
                 return (
                     <>
                         <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                         <Typography variant="h5" gutterBottom>Verification Failed</Typography>
                         <Typography color="text.secondary">{reason || 'Could not verify your email.'}</Typography>
                         <Button component={RouterLink} to="/register" variant="outlined" sx={{ mt: 3 }}>Try Registering Again</Button>
                    </>
                 );
            case 'loading': default:
                return <CircularProgress />;
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {renderContent()}
                 </motion.div>
             </Paper>
        </Container>
    );
};

export default EmailVerificationResultPage;