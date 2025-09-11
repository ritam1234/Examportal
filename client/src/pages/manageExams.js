// src/pages/ManageExams.js
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
// REMOVED: import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import ExamForm from '../components/Admin/ExamForm'; // Keep for Edit/Create
// REMOVED: import AssignExam from '../components/Admin/AssignExam'; // No longer used directly here
import { getAllExamsAdmin, deleteExamAdmin } from '../api/exams';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import dayjs from 'dayjs';

const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFormDialog, setShowFormDialog] = useState(false);
    // REMOVED state for assignment dialog
    // const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [editingExam, setEditingExam] = useState(null); // Keep for Edit
    // REMOVED state for exam to assign
    // const [examToAssign, setExamToAssign] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null); // Keep for Delete

    // fetchExams remains the same
    const fetchExams = useCallback(async () => {
        setIsLoading(true); setError('');
        try {
            const { success, data } = await getAllExamsAdmin();
            if (success) setExams(data || []);
            else setError('Failed to fetch exams.');
        } catch (err) { setError(err.response?.data?.message || 'An error occurred while fetching exams.'); console.error("Fetch exams error:", err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchExams(); }, [fetchExams]);

    // handleAddNew and handleEdit remain the same
    const handleAddNew = () => { setEditingExam(null); setShowFormDialog(true); };
    const handleEdit = (exam) => { setEditingExam(exam); setShowFormDialog(true); };

    // REMOVED handleAssign function
    // const handleAssign = (exam) => { ... };

    // handleDeleteClick and handleDeleteConfirm remain the same
     const handleDeleteClick = (exam) => { setExamToDelete(exam); setDeleteConfirmOpen(true); };
     const handleDeleteConfirm = async () => {
        if (!examToDelete) return; setIsLoading(true);
        try {
            await deleteExamAdmin(examToDelete._id);
            setExamToDelete(null); setDeleteConfirmOpen(false); await fetchExams();
        } catch (err) { setError(err.response?.data?.message || 'Failed to delete exam.'); console.error("Delete exam error:", err); setIsLoading(false); setDeleteConfirmOpen(false); }
     };

    // Updated handleCloseDialog to ONLY handle the form dialog
    const handleCloseDialog = () => {
        setShowFormDialog(false);
        // REMOVED: setShowAssignDialog(false);
        setEditingExam(null);
        // REMOVED: setExamToAssign(null);
    };

    // handleSuccess remains the same, called by ExamForm on success
     const handleSuccess = () => {
        handleCloseDialog();
        fetchExams();
    }

     // isLoading render logic remains the same
     if (isLoading && exams.length === 0) { return <LoadingSpinner />; }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Manage Exams
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAddNew} sx={{ mb: 2 }}>
                Create New Exam
            </Button>

            {exams.length === 0 && !isLoading && !error ? (
                 <Typography sx={{ mt: 3 }}>No exams found. Create one to get started!</Typography>
            ) : (
                <Paper elevation={2}>
                    {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={30} /></Box>}
                    <List>
                        {exams.map((exam) => (
                            <ListItem
                                key={exam._id}
                                divider
                                secondaryAction={
                                    <>
                                        {/* REMOVED Assign Icon Button */}
                                        {/* <IconButton edge="end" aria-label="assign" title="Assign Students" onClick={() => handleAssign(exam)} sx={{ mr: 1 }}>
                                             <AssignmentIndIcon />
                                         </IconButton> */}
                                        <IconButton edge="end" aria-label="edit" title="Edit Exam" onClick={() => handleEdit(exam)} sx={{ mr: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" title="Delete Exam" onClick={() => handleDeleteClick(exam)}>
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={exam.title}
                                     secondary={`Start: ${exam.startTime ? dayjs(exam.startTime).format('DD MMM YYYY, h:mm A') : 'Not Set'} | Duration: ${exam.duration} mins | Questions: ${exam.questions?.length || 0}`}
                                     primaryTypographyProps={{ sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Exam Add/Edit Form Dialog - Remains the same */}
             <Dialog open={showFormDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
                <DialogContent>
                    <ExamForm
                        initialData={editingExam}
                        onSuccess={handleSuccess}
                        onCancel={handleCloseDialog}
                    />
                 </DialogContent>
            </Dialog>

             {/* REMOVED Assign Students Dialog */}
             {/* <Dialog open={showAssignDialog} ... > ... </Dialog> */}

             {/* Delete Confirmation Dialog - Remains the same */}
              <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                 <DialogTitle>Confirm Delete Exam</DialogTitle>
                 <DialogContent>
                    <Typography>Are you sure you want to delete the exam: "{examToDelete?.title}"?</Typography>
                      <Typography variant="caption" color="error">This action cannot be undone. Results may be affected.</Typography>
                 </DialogContent>
                 <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">Cancel</Button>
                     <Button onClick={handleDeleteConfirm} color="error" disabled={isLoading}>
                         {isLoading ? <CircularProgress size={20} /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ManageExams;