import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

const HomePage = () => {
    const { user } = useAuth();

    const dashboardLink = user
        ? (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard')
        : '/login';

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Welcome to the Exam Portal!
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Your platform for online assessments. Login or register to continue.
                </Typography>
                <Box sx={{ mt: 4 }}>
                    {user ? (
                        <Button
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            to={dashboardLink}
                        >
                            Go to Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                size="large"
                                component={RouterLink}
                                to="/login"
                                sx={{ mr: 2 }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                component={RouterLink}
                                to="/register"
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default HomePage;