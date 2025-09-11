import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';

import { getMyResultsList } from '../api/results';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ResultList from '../components/Student/ResultList'; // Reuse the component from dashboard


const ResultsPage = () => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchResults = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
             const { success, data } = await getMyResultsList();
             if (success) {
                setResults(data || []);
            } else {
                 setError('Failed to fetch your results.');
             }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching results.');
            console.error("Fetch my results error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                My Exam Results
            </Typography>

             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

             {isLoading ? (
                <LoadingSpinner />
             ) : (
                <Paper elevation={2} sx={{ p: 2 }}>
                    {results.length === 0 && !error ? (
                         <Typography>You haven't completed any exams yet.</Typography>
                    ) : (
                        // Use the ResultList component to display fetched results
                         <ResultList results={results} isLoading={false} />
                    )}
                 </Paper>
             )}
         </Container>
    );
};

export default ResultsPage;