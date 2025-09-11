// src/components/Admin/AssignExam.js
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { getAllStudentsAdmin } from '../../api/users';
import { updateExamAdmin, getExamDetails } from '../../api/exams';
import { getAllResultsAdmin } from '../../api/results';

const AssignExam = ({ exam, onSuccess, onCancel }) => {
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
    const [examResults, setExamResults] = useState([]); // Results for this exam
    const [currentExamData, setCurrentExamData] = useState(null); // Store full exam details
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch all data needed for assignment screen
    const fetchData = useCallback(async () => {
        if (!exam?._id) {
            setError("Exam ID is missing.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Fetch students, latest exam details, and results for this exam in parallel
            const [studentsRes, examDetailsRes, resultsRes] = await Promise.all([
                getAllStudentsAdmin(),
                getExamDetails(exam._id),
                getAllResultsAdmin({ examId: exam._id }) // Filter results by this exam ID
            ]);

            // Process students
            if (studentsRes.success) {
                setAllStudents(studentsRes.data || []);
            } else {
                throw new Error('Failed to load students list.');
            }

            // Process latest exam details (needed for current assignments)
            if (examDetailsRes.success && examDetailsRes.data) {
                setCurrentExamData(examDetailsRes.data);
                // Use Set for efficient assignment checks later
                setSelectedStudentIds(new Set(
                    examDetailsRes.data.assignedTo?.map(s => typeof s === 'string' ? s : s._id) || []
                ));
            } else {
                throw new Error('Failed to load current exam assignment details.');
            }

            // Process results (to determine who has taken it)
            if (resultsRes.success) {
                setExamResults(resultsRes.data || []);
            } else {
                throw new Error('Failed to load results for this exam.');
            }

        } catch (err) {
            setError(err.message || 'Error fetching data for assignment.');
            console.error("AssignExam fetchData error:", err);
            setAllStudents([]);
            setSelectedStudentIds(new Set());
            setExamResults([]);
            setCurrentExamData(null);
        } finally {
            setIsLoading(false);
        }
    }, [exam?._id]); // Depend only on exam._id

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Toggle selection for a student
    const handleToggleStudent = (studentId) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) newSet.delete(studentId);
            else newSet.add(studentId);
            return newSet;
        });
    };

    // Check if student result exists for this exam
    const hasStudentTakenExam = useCallback((studentId) => {
        return examResults.some(result =>
            result.student === studentId || result.student?._id === studentId
        );
    }, [examResults]);

    // Submit updated assignment list
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!currentExamData) { setError("Exam data is missing for update."); return; }
        setIsSubmitting(true); setError('');

        try {
            // Prepare data using currentExamData and updated assignments
            const examDataToUpdate = {
                title: currentExamData.title,
                description: currentExamData.description,
                duration: currentExamData.duration,
                startTime: currentExamData.startTime, // Keep existing start time
                questions: currentExamData.questions.map(q => typeof q === 'string' ? q : q._id),
                assignedTo: Array.from(selectedStudentIds), // Send the updated array of IDs
            };

            await updateExamAdmin(currentExamData._id, examDataToUpdate);
            setIsSubmitting(false);
            if(onSuccess) onSuccess(); // Notify parent to refresh list/close dialog

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update student assignments.');
            console.error("Assign students submit error:", err);
            setIsSubmitting(false);
        }
    };

    // Render loading state
    if (isLoading) {
        return <Box sx={{ textAlign: 'center', p: 3 }}><CircularProgress /></Box>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body1" gutterBottom>
                Select students for: <strong>{currentExamData?.title || exam?.title || ''}</strong>
            </Typography>
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', mt: 2, mb: 2 }}>
                <List dense disablePadding>
                    {allStudents.map((student) => {
                        const isSelected = selectedStudentIds.has(student._id);
                        const hasTaken = hasStudentTakenExam(student._id);
                        const labelId = `checkbox-list-label-${student._id}`;

                        return (
                            <ListItem
                                key={student._id}
                                secondaryAction={
                                    hasTaken ? (
                                        <Chip label="Taken" size="small" color="success" icon={<CheckCircleIcon sx={{fontSize: '1rem'}} />} sx={{mr:1}}/>
                                    ) : null
                                }
                                disablePadding
                            >
                                <ListItemButton onClick={() => handleToggleStudent(student._id)} disabled={isSubmitting}>
                                    <ListItemIcon sx={{minWidth: 0, mr: 1.5}}>
                                        <Checkbox
                                            edge="start"
                                            checked={isSelected}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                            disabled={isSubmitting}
                                            size="small"
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        id={labelId}
                                        primary={`${student.name}`}
                                        secondary={`${student.email}`}
                                        primaryTypographyProps={{variant:'body2'}}
                                        secondaryTypographyProps={{variant:'caption'}}
                                     />
                                    {/* Optional Chip for 'Assigned' status if needed when just selected but not taken */}
                                     {/* {isSelected && !hasTaken && <Chip label="Assigned" size="small" variant="outlined" color="info" icon={<HelpOutlineIcon sx={{fontSize: '1rem'}} />} sx={{ml:1, mr: hasTaken ? 1 : 0}}/>} */}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
            <Typography variant="caption">{selectedStudentIds.size} students selected.</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {onCancel && <Button onClick={onCancel} disabled={isSubmitting} sx={{ mr: 1 }} color="secondary">Cancel</Button>}
                <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}> Save Assignments </Button>
            </Box>
        </Box>
    );
};

AssignExam.propTypes = {
    exam: PropTypes.object, // Exam object needed for ID primarily
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
};

export default AssignExam;