import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Correct
import CancelIcon from '@mui/icons-material/Cancel'; // Incorrect
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'; // Not selected / or Error?
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import { getResultDetailsById } from '../api/results';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import useAuth from '../hooks/useAuth';


const ViewAllResultDetails = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
     const { user } = useAuth(); // To determine back button link
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchResultDetails = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
             const { success, data } = await getResultDetailsById(resultId);
            if (success && data) {
                 // Backend authorization should prevent access, but double-check here if necessary
                setResult(data);
            } else {
                 setError('Failed to load result details.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred fetching result details.');
            console.error("Fetch result details error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [resultId]);

    useEffect(() => {
        fetchResultDetails();
    }, [fetchResultDetails]);

    const getIcon = (isCorrect) => {
        return isCorrect
            ? <CheckCircleIcon color="success" />
            : <CancelIcon color="error" />;
    }

     const getSelectedMarker = (question, selectedOption) => {
         if (!selectedOption || !question?.options) return null; // Handle missing data
         return question.options.includes(selectedOption) ? '(Your Answer)' : '(Invalid Answer Recorded)';
     }

     const getCorrectMarker = (question, option) => {
          if (option === question?.correctAnswer) return <strong> (Correct Answer)</strong>;
          return null;
      };


     if (isLoading) {
        return <LoadingSpinner />;
    }

     if (error) {
        return (
             <Container maxWidth="md" sx={{ mt: 4 }}>
                 <Alert severity="error" action={
                      <Button color="inherit" size="small" onClick={() => navigate(user?.role === 'admin' ? '/admin/results' : '/results')}>
                          Back to Results
                      </Button>
                  }>
                    {error}
                 </Alert>
            </Container>
         );
    }

     if (!result) {
        return (
             <Container maxWidth="md" sx={{ mt: 4 }}>
                 <Typography>Result data not found.</Typography>
                 <Button onClick={() => navigate(user?.role === 'admin' ? '/admin/results' : '/results')} sx={{mt: 2}}>
                    Back to Results
                 </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
                 Result Details
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                 <Grid container spacing={2}>
                     <Grid item xs={12} sm={6}>
                        <Typography variant="h6">Exam: {result.exam?.title || 'N/A'}</Typography>
                         <Typography color="text.secondary">Student: {result.student?.name} ({result.student?.email})</Typography>
                     </Grid>
                     <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                         <Typography variant="h5">
                            Score: {result.score} / {result.totalQuestions} ({result.percentage.toFixed(1)}%)
                         </Typography>
                        <Typography color="text.secondary">
                             Submitted: {new Date(result.submittedAt).toLocaleString()}
                        </Typography>
                     </Grid>
                 </Grid>
             </Paper>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
                 Your Answers:
            </Typography>

             <Paper elevation={1} variant="outlined">
                <List>
                     {result.answers?.map((ans, index) => (
                        <React.Fragment key={ans.questionId?._id || index}>
                            <ListItem alignItems="flex-start" sx={{ flexDirection: 'column'}}>
                                 <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                                    <ListItemIcon sx={{minWidth: 40}}>
                                        {getIcon(ans.isCorrect)}
                                    </ListItemIcon>
                                    <ListItemText
                                         primary={`Q${index + 1}: ${ans.questionId?.questionText || 'Question text not loaded'}`}
                                         primaryTypographyProps={{ fontWeight: 'medium' }}
                                     />
                                </Box>
                                 <Box sx={{ pl: 5, width: '100%'}}> {/* Indent the options */}
                                      <Typography variant="caption" sx={{ mb: 1, display: 'block'}}>Your answer: {ans.selectedOption ? `"${ans.selectedOption}"` : <i>Not Answered</i>}</Typography>

                                     {/* Optionally show all options with correct/your marks */}
                                     {/* <List dense disablePadding>
                                          {ans.questionId?.options?.map((opt, optIndex) => (
                                              <ListItem key={optIndex} disablePadding>
                                                  <ListItemText
                                                      primary={
                                                         <>
                                                             {opt}
                                                             {ans.selectedOption === opt && <Typography variant="caption" color="primary.main" sx={{ml:1}}> (Your Answer)</Typography>}
                                                             {opt === ans.questionId?.correctAnswer && <Typography variant="caption" color="success.main" sx={{ml:1}}> (Correct Answer)</Typography>}
                                                          </>
                                                      }
                                                      primaryTypographyProps={{ variant: 'body2', color: opt === ans.questionId?.correctAnswer ? 'success.dark' : 'text.secondary' }}
                                                  />
                                             </ListItem>
                                          ))}
                                      </List> */}
                                      {!ans.isCorrect && (
                                          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                              Correct Answer: "{ans.questionId?.correctAnswer || 'N/A'}"
                                           </Typography>
                                      )}
                                 </Box>
                            </ListItem>
                             {index < result.answers.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                     ))}
                </List>
             </Paper>

             <Button onClick={() => navigate(user?.role === 'admin' ? '/admin/results' : '/results')} sx={{ mt: 3 }} variant="outlined">
                 Back to Results List
            </Button>
         </Container>
    );
};

export default ViewAllResultDetails;