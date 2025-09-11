import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
// Import components for filtering if needed (Select for Exam, Autocomplete for Student)

import { getAllResultsAdmin } from '../api/results';
import LoadingSpinner from '../components/Common/LoadingSpinner';


const ViewAllResults = () => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    // Add state for filters (e.g., selectedExamId, selectedStudentId)

    const fetchAllResults = useCallback(async (filters = {}) => {
        setIsLoading(true);
        setError('');
        try {
             // Pass filters to API call
             const { success, data } = await getAllResultsAdmin(filters);
             if (success) {
                setResults(data || []);
            } else {
                 setError('Failed to fetch results.');
             }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching results.');
            console.error("Fetch all results error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllResults(); // Fetch initially without filters
    }, [fetchAllResults]);

    // Handlers for filter changes would go here
    // const handleExamFilterChange = (...) => { fetchAllResults({ examId: ... }) };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                View All Student Results
            </Typography>

            {/* Add Filter Components Here */}
            {/* e.g., Select dropdown for exams, Autocomplete for students */}

             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

             {isLoading ? (
                <LoadingSpinner />
             ) : (
                <Paper elevation={2} sx={{ p: 0 }}> {/* Remove padding if List handles it */}
                    {results.length === 0 && !error ? (
                         <Typography sx={{ p: 2 }}>No results found matching the criteria.</Typography>
                    ) : (
                        <List disablePadding>
                             {results.map((result) => (
                                 <ListItem
                                     key={result._id}
                                     divider
                                     secondaryAction={
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                             component={RouterLink}
                                            // Use admin-specific route or same as student if permissions allow
                                             to={`/admin/results/${result._id}`} // Example route
                                         >
                                             View Details
                                         </Button>
                                    }
                                >
                                    <ListItemText
                                         // Check for populated data from backend
                                        primary={result.exam?.title || `Exam ID: ${result.exam}`} // Fallback if not populated
                                         secondary={`Student: ${result.student?.name || result.student} | Score: ${result.score}/${result.totalQuestions} (${result.percentage.toFixed(1)}%) | Submitted: ${new Date(result.submittedAt).toLocaleDateString()}`}
                                     />
                                 </ListItem>
                             ))}
                         </List>
                    )}
                 </Paper>
             )}
        </Container>
    );
};

export default ViewAllResults;