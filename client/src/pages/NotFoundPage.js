import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const NotFoundPage = () => {
    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
            <SentimentVeryDissatisfiedIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom>
                404 - Page Not Found
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
                Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </Typography>
            <Box sx={{ mt: 4 }}>
                <Button
                    variant="contained"
                    component={RouterLink}
                    to="/" // Link to homepage
                >
                    Go to Homepage
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;