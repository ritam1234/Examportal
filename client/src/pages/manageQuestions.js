import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import QuestionForm from '../components/Admin/QuestionForm'; // Assume this is the form component
import { getAllQuestions, deleteQuestion } from '../api/questions'; // API functions
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ManageQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null); // Question object to edit, or null for new
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);


    const fetchQuestions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const { success, data } = await getAllQuestions();
            if (success) {
                setQuestions(data || []);
            } else {
                setError('Failed to fetch questions.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching questions.');
            console.error("Fetch questions error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleAddNew = () => {
        setEditingQuestion(null); // Clear any editing state
        setShowForm(true);
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setShowForm(true);
    };

    const handleDeleteClick = (question) => {
        setQuestionToDelete(question);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
         if (!questionToDelete) return;
        setIsLoading(true); // Show loading during delete
        try {
             await deleteQuestion(questionToDelete._id);
             setQuestionToDelete(null);
             setDeleteConfirmOpen(false);
             // Refresh the list after delete
             await fetchQuestions(); // Re-fetch data
         } catch (err) {
             setError(err.response?.data?.message || 'Failed to delete question.');
             console.error("Delete question error:", err);
              setIsLoading(false); // Stop loading on error
              setDeleteConfirmOpen(false); // Close dialog on error
         }
        // setIsLoading handled by fetchQuestions in finally block if successful
    };


    const handleCloseForm = () => {
        setShowForm(false);
        setEditingQuestion(null); // Reset editing state
    };

    const handleFormSuccess = () => {
        handleCloseForm();
        fetchQuestions(); // Refresh list after add/update
    }

    if (isLoading && questions.length === 0) { // Show loading only on initial load
        return <LoadingSpinner />;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Manage Questions
            </Typography>

             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

             <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddNew}
                sx={{ mb: 2 }}
             >
                 Add New Question
             </Button>

             {questions.length === 0 && !isLoading && !error ? (
                <Typography sx={{mt: 3}}>No questions found. Add one to get started!</Typography>
            ) : (
                <Paper elevation={2}>
                     {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', p:2}}><CircularProgress size={30}/></Box> /* Show smaller loader on refresh */}
                     <List>
                        {questions.map((q) => (
                            <ListItem
                                key={q._id}
                                divider
                                secondaryAction={
                                    <>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(q)} sx={{mr: 1}}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(q)}>
                                            <DeleteIcon color="error"/>
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={q.questionText}
                                     // secondary={`Options: ${q.options.join(', ')} | Correct: ${q.correctAnswer}`}
                                     primaryTypographyProps={{ sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Question Add/Edit Form Dialog */}
             <Dialog open={showForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
                 <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                 <DialogContent>
                     {/* Render the form inside */}
                    <QuestionForm
                        initialData={editingQuestion} // Pass existing data for editing
                        onSuccess={handleFormSuccess}
                        onCancel={handleCloseForm}
                    />
                 </DialogContent>
             </Dialog>

             {/* Delete Confirmation Dialog */}
              <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                     <Typography>Are you sure you want to delete the question: "{questionToDelete?.questionText}"?</Typography>
                      <Typography variant="caption" color="error">This action cannot be undone. Consider if this question is used in any exams.</Typography>
                 </DialogContent>
                <DialogActions>
                     <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={20}/> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default ManageQuestions;
