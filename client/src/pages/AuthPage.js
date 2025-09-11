// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper'; // Use Paper for background/elevation
import Container from '@mui/material/Container';

import LoginPageContent from './LoginPageContent'; // We'll extract form logic
import RegisterPageContent from './RegisterPageContent'; // Extract form logic
import useAuth from '../hooks/useAuth'; // Check if already logged in

import '../assets/AuthFlip.css'; // Import the flip CSS

const AuthPage = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

     // Redirect if user is already logged in
    if (user) {
        const redirectTo = location.state?.from?.pathname || (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        return <Navigate to={redirectTo} replace />;
    }


    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <Container component="main" maxWidth="xs"> {/* Keep overall container centered */}
             <div className="auth-flip-container">
                <div className={`auth-flipper ${isFlipped ? 'is-flipped' : ''}`}>
                     {/* Front Face (Login) */}
                     <div className="auth-card-face auth-card-front">
                         <Paper elevation={4} sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                             <LoginPageContent onFlip={handleFlip} />
                         </Paper>
                     </div>

                     {/* Back Face (Register) */}
                     <div className="auth-card-face auth-card-back">
                         <Paper elevation={4} sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <RegisterPageContent onFlip={handleFlip} />
                        </Paper>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AuthPage;