// src/pages/AdminDashboard.js
// THIS FILE REMAINS THE SAME AS THE PREVIOUSLY PROVIDED SIMPLIFIED VERSION
// It assumes AdminLayout.js provides the sidebar navigation.

import React from 'react';
import Container from '@mui/material/Container'; // Keep Container or Box as needed for padding
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const AdminDashboard = () => {
    // Optional: Fetch summary stats (questions count, exams count, etc.) here if needed

    return (
        // Using Box, assuming AdminLayout provides Container/padding
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Admin Dashboard Overview
            </Typography>

            <Grid container spacing={3}>
                {/* Placeholder for summary widgets */}
                <Grid item xs={12} md={8}>
                     <Paper elevation={2} sx={{ p: 3 }}>
                         <Typography variant="h6" gutterBottom>Welcome!</Typography>
                         <Typography>
                             Use the navigation panel on the left to manage questions, exams, view results, and analyze performance.
                         </Typography>
                         {/* Display summary data here */}
                     </Paper>
                </Grid>
                {/* Add more widgets as needed */}
             </Grid>
        </Box>
    );
};

export default AdminDashboard;