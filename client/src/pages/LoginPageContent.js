// src/pages/LoginPageContent.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LockOpenIcon from '@mui/icons-material/LockOpen'; // Different icon for Login maybe
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles'; // To access theme colors
import { Link as RouterLink } from 'react-router-dom'; // Add RouterLink

import useAuth from '../hooks/useAuth';

const LoginPageContent = ({ onFlip }) => {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate(); // Kept for navigation logic after successful login
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (event) => {
        event.preventDefault(); setError('');
        if (!email || !password) { setError("Email and password required."); return; }
        setIsSubmitting(true);
        try {
            const success = await login(email, password);
             if(success) {
                 // Success state is managed by AuthContext which triggers App.js redirect
                  console.log("Login successful, waiting for context redirect...");
                  // navigate(from, { replace: true }); // Navigation now primarily handled by context/App.js
             }
             // Error is thrown by login function if API fails
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
            console.error("Login Page Error:", err);
        } finally {
             setIsSubmitting(false);
        }
    };

    return (
         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Login Icon */}
             <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}> {/* Use theme primary color */}
                 <LockOpenIcon />
             </Avatar>
            {/* Sign in Heading */}
             <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                 Sign in
             </Typography>
            {/* Error Alert */}
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Login Form */}
             <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
                     error={!!error && !email.trim()} // Basic feedback
                 />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                     disabled={isSubmitting}
                     error={!!error && !password} // Basic feedback
                />
                 {/* Add forgot password/remember me if needed */}
                 {/* <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me"/> */}

                 {/* Sign In Button */}
                 <Button
                     type="submit"
                    fullWidth
                    variant="contained"
                     disabled={isSubmitting}
                    sx={{
                        mt: 3, mb: 2,
                        py: 1.2,
                         fontWeight: 'bold',
                         bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Sign In'}
                </Button>

                 {/* Bottom Link */}
                <Box sx={{ textAlign: 'justify' }}> {/* Center align link box */}
                    <Grid container sx={{ mt: 1 }}>
        <Grid item xs>
          <Link component={RouterLink} to="/request-password-reset" variant="body2">
            Forgot password?
          </Link>
        </Grid>
        <Grid item>
          <Link component="button" type="button" onClick={onFlip} variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Grid>
      </Grid>
                 </Box>
            </Box>
         </Box>
    );
};

LoginPageContent.propTypes = { onFlip: PropTypes.func.isRequired, };
export default LoginPageContent;