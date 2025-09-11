// src/pages/AssignExamPage.js
import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Snackbar from '@mui/material/Snackbar'; // For success messages

import { getAllExamsAdmin, getExamDetails, updateExamAdmin } from '../api/exams';
import { getAllStudentsAdmin } from '../api/users';
import { getAllResultsAdmin } from '../api/results';
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Ensure this component exists and works

// --- Reusable Student List Item Component ---
const StudentListItem = ({ student, isChecked, onToggle, isDisabled, primaryText, secondaryText }) => {
    const labelId = `checkbox-list-label-${student._id}`;
    return (
        <ListItem key={student._id} disablePadding sx={{ '&:hover': { backgroundColor: isDisabled ? 'inherit': 'action.hover' }}}>
            <ListItemButton role={undefined} onClick={() => !isDisabled && onToggle(student._id)} dense disabled={isDisabled} sx={{ pl:1 }}> {/* Check if toggle should be disabled */}
                <ListItemIcon sx={{ minWidth: 0, mr: 1 }}>
                    <Checkbox
                        edge="start"
                        checked={isChecked}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                        disabled={isDisabled}
                        size="small"
                    />
                </ListItemIcon>
                <ListItemText
                    id={labelId}
                    primary={primaryText || `${student.name}`}
                    secondary={secondaryText || `${student.email}`}
                    primaryTypographyProps={{ variant: 'body2', sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                    secondaryTypographyProps={{ variant: 'caption', sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
                />
            </ListItemButton>
        </ListItem>
    );
}

// --- Main Assign Exam Page Component ---
const AssignExamPage = () => {
    // State declarations
    const [availableExams, setAvailableExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null); // Holds selected exam OBJECT
    const [currentExamDetails, setCurrentExamDetails] = useState(null); // Holds full details from GET /exams/:id
    const [allStudentsMap, setAllStudentsMap] = useState({}); // Map ID -> student obj
    const [availableIds, setAvailableIds] = useState([]);    // Student IDs available for assignment
    const [assignedIds, setAssignedIds] = useState([]);      // Student IDs assigned (but not taken)
    const [takenIds, setTakenIds] = useState([]);            // Student IDs who have completed this exam
    const [checkedAvailable, setCheckedAvailable] = useState(new Set()); // Checked IDs in Available column
    const [checkedAssigned, setCheckedAssigned] = useState(new Set());   // Checked IDs in Assigned column
    const [isLoadingExams, setIsLoadingExams] = useState(true); // Loading exam list
    const [isLoadingData, setIsLoadingData] = useState(false); // Loading assignment details for selected exam
    const [isSubmitting, setIsSubmitting] = useState(false); // Saving assignments state
    const [error, setError] = useState(''); // Error messages
    const [successMessage, setSuccessMessage] = useState(''); // Success Snackbar message

    // Fetch initial list of exams for the dropdown selector
    const fetchExams = useCallback(async () => {
        setIsLoadingExams(true); setError('');
        try {
            const { success, data } = await getAllExamsAdmin();
            if (success) setAvailableExams(data || []);
            else setError('Failed to load exams.');
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching exams list.');
            console.error("fetchExams error:", err);
        } finally {
            setIsLoadingExams(false);
        }
    }, []);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    // Load assignment/student/result data when an exam is selected
    const loadAssignmentData = useCallback(async (examId) => {
        if (!examId) {
            setSelectedExam(null); setCurrentExamDetails(null); setAllStudentsMap({});
            setAvailableIds([]); setAssignedIds([]); setTakenIds([]);
            setCheckedAvailable(new Set()); setCheckedAssigned(new Set());
            setError('');
            return;
        }
        setIsLoadingData(true); setError('');
        setAvailableIds([]); setAssignedIds([]); setTakenIds([]); // Reset lists for visual feedback

        try {
            const [studentsRes, examDetailsRes, resultsRes] = await Promise.all([
                getAllStudentsAdmin(),
                getExamDetails(examId),
                getAllResultsAdmin({ examId: examId })
            ]);

            if (!studentsRes.success) throw new Error('Failed to load student list.');
            const studentMap = studentsRes.data.reduce((map, student) => { map[student._id] = student; return map; }, {});
            setAllStudentsMap(studentMap);

            if (!examDetailsRes.success || !examDetailsRes.data) throw new Error('Failed to load exam details.');
            setCurrentExamDetails(examDetailsRes.data);

            // Ensure results API call succeeded before processing results
             if (!resultsRes.success) console.warn('Warning: Failed to load results for taken status.'); // Log warning but maybe continue

            // Categorize students based on fetched data
            const currentAssignedIds = new Set(examDetailsRes.data.assignedTo?.map(s => typeof s === 'string' ? s : s._id) || []);
             const resultsMap = new Map((resultsRes.data || []).map(r => [(r.student === 'string' ? r.student : r.student?._id), r])); // Handle potentially failed results fetch
             const available = [], assigned = [], taken = [];

            Object.keys(studentMap).forEach(studentId => {
                if (resultsMap.has(studentId)) {
                    taken.push(studentId);
                } else if (currentAssignedIds.has(studentId)) {
                    assigned.push(studentId);
                } else {
                    available.push(studentId);
                }
            });

             // Sort alphabetically before setting state
             const sortByName = (idA, idB) => (allStudentsMap[idA]?.name || '').localeCompare(allStudentsMap[idB]?.name || '');
             setAvailableIds(available.sort(sortByName));
             setAssignedIds(assigned.sort(sortByName));
             setTakenIds(taken.sort(sortByName));

             // Reset checked items AFTER data is successfully loaded and categorized
            setCheckedAvailable(new Set());
            setCheckedAssigned(new Set());

        } catch (err) {
            setError(err.message || 'Error loading assignment data.');
            console.error("Load Assignment Data Error:", err);
            setAllStudentsMap({}); setCurrentExamDetails(null);
            setAvailableIds([]); setAssignedIds([]); setTakenIds([]);
            setCheckedAvailable(new Set()); setCheckedAssigned(new Set());
        } finally {
            setIsLoadingData(false);
        }
    }, []); // loadAssignmentData itself has no internal dependencies that change

    // Handle changes in the Exam Selector dropdown
    const handleExamChange = (event) => {
        const examId = event.target.value;
        const chosenExam = availableExams.find(exam => exam._id === examId) || null;
        setSelectedExam(chosenExam);
        loadAssignmentData(examId); // Load data for the selected ID
    };

    // --- Checkbox Toggle Handlers ---
    const handleToggleAvailableCheck = (studentId) => setCheckedAvailable(prev => { const ns = new Set(prev); if (ns.has(studentId)) ns.delete(studentId); else ns.add(studentId); return ns; });
    const handleToggleAssignedCheck = (studentId) => setCheckedAssigned(prev => { const ns = new Set(prev); if (ns.has(studentId)) ns.delete(studentId); else ns.add(studentId); return ns; });

    // --- Button Handlers for Assign/Unassign (Update local state only) ---
    const handleAssignSelected = () => {
        if (checkedAvailable.size === 0) return;
        const itemsToMove = Array.from(checkedAvailable);
        const sortByName = (idA, idB) => (allStudentsMap[idA]?.name || '').localeCompare(allStudentsMap[idB]?.name || '');
        setAssignedIds(prev => [...prev, ...itemsToMove].sort(sortByName));
        setAvailableIds(prev => prev.filter(id => !checkedAvailable.has(id)));
        setCheckedAvailable(new Set());
    };
    const handleUnassignSelected = () => {
        if (checkedAssigned.size === 0) return;
        const itemsToMove = Array.from(checkedAssigned);
        const sortByName = (idA, idB) => (allStudentsMap[idA]?.name || '').localeCompare(allStudentsMap[idB]?.name || '');
        setAvailableIds(prev => [...prev, ...itemsToMove].sort(sortByName));
        setAssignedIds(prev => prev.filter(id => !checkedAssigned.has(id)));
        setCheckedAssigned(new Set());
    };

    // --- Save Assignments to Backend ---
    const handleSaveAssignments = async () => {
        if (!selectedExam || !currentExamDetails) {
            setError("Cannot save, ensure an exam is selected and data has loaded.");
            return;
        }
        setIsSubmitting(true); setError(''); setSuccessMessage('');

        try {
            const examDataToUpdate = {
                title: currentExamDetails.title,
                description: currentExamDetails.description,
                duration: currentExamDetails.duration,
                startTime: currentExamDetails.startTime,
                questions: currentExamDetails.questions.map(q => typeof q === 'string' ? q : q._id),
                assignedTo: assignedIds, // Send the CURRENT state of assigned IDs
            };

            console.log(`Saving assignments for exam ${selectedExam._id}. Sending assignedTo:`, assignedIds); // Frontend Log
            await updateExamAdmin(selectedExam._id, examDataToUpdate);

            setSuccessMessage('Assignments updated successfully!');
            // IMPORTANT: Reload data from backend AFTER successful save
            await loadAssignmentData(selectedExam._id); // Re-fetch to confirm and update UI correctly

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save assignments. Please check server logs and try again.');
            console.error("Save Assignments Error:", err);
            // Decide whether to reload data on error. Often better to just show error.
            // await loadAssignmentData(selectedExam._id);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Close Snackbar message ---
    const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setSuccessMessage(''); };

    // --- List Rendering Helper ---
    const renderStudentList = (title, studentIds, checkedSet, toggleCheck, actionButton, color = 'default') => (
        <Paper elevation={2} sx={{ p: 1.5, height: '65vh', display: 'flex', flexDirection: 'column', borderTop: '3px solid', borderColor: `${color}.main` }}>
             <Typography variant="subtitle1" sx={{ textAlign: 'center', borderBottom: '1px solid', borderColor:'divider', pb:1, mb: 1, fontWeight:'medium'}}>{`${title} (${studentIds.length})`}</Typography>
             <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 1, pr: 0.5 /* Allow space for scrollbar */ }}>
                 <List dense disablePadding>
                     {studentIds.map(id => {
                         const student = allStudentsMap[id];
                         const isDisabled = title === 'Exam Taken'; // Make sure title matches exactly
                         const isChecked = isDisabled ? false : (title === 'Available Students' ? checkedSet.has(id) : checkedSet.has(id)); // Adjust title check if needed
                         return student ? (
                             <StudentListItem key={id} student={student} isChecked={isChecked} onToggle={toggleCheck} isDisabled={isDisabled}/>
                         ) : <ListItem key={id} dense><ListItemText primary="Loading..." sx={{color: 'text.disabled'}}/></ListItem>; // Basic fallback
                     })}
                    {studentIds.length === 0 && <Typography variant="caption" sx={{ p: 2, textAlign: 'center', display: 'block', color:'text.secondary' }}>None</Typography>}
                </List>
            </Box>
           {actionButton} {/* Render the passed button */}
        </Paper>
    );

    // --- Main Render ---
    return (
        <Container maxWidth="lg"> {/* Use Large width for 3 columns */}
            <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>Assign Students to Exam</Typography>

            {/* Exam Selector */}
            <Box sx={{ mb: 3, maxWidth: 500 }}>
                {isLoadingExams ? <CircularProgress size={25}/> :
                    <FormControl fullWidth size="small" required disabled={availableExams.length === 0}>
                        <InputLabel id="select-exam-assign-label">Select Exam</InputLabel>
                        <Select
                            labelId="select-exam-assign-label"
                            id="select-exam-assign"
                            value={selectedExam?._id || ''}
                            label="Select Exam *" // Indicate required
                            onChange={handleExamChange}
                        >
                            <MenuItem value="" disabled><em>{availableExams.length === 0 ? 'No exams available' : '-- Select Exam --'}</em></MenuItem>
                            {availableExams.map((exam) => ( <MenuItem key={exam._id} value={exam._id}>{exam.title}</MenuItem> ))}
                        </Select>
                    </FormControl>
                }
            </Box>

            {/* Error display */}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Assignment Area - Show Loading or Columns */}
            {isLoadingData && selectedExam && <Box sx={{textAlign:'center', p:5}}><CircularProgress /></Box>}

            {!isLoadingData && selectedExam && currentExamDetails && (
                <Grid container spacing={2.5} alignItems="stretch">
                    {/* Column 1: Available */}
                    <Grid item xs={12} md={5}>
                        {renderStudentList(
                            'Available Students',
                            availableIds,
                            checkedAvailable,
                            handleToggleAvailableCheck,
                            <Button fullWidth variant="outlined" size="small" onClick={handleAssignSelected} disabled={checkedAvailable.size === 0 || isSubmitting} endIcon={<ArrowForwardIcon />} sx={{mt:'auto'}}>Assign ({checkedAvailable.size})</Button>,
                            'primary'
                        )}
                    </Grid>
                    {/* Column 2: Assigned */}
                    <Grid item xs={12} md={5}>
                        {renderStudentList(
                            'Assigned (Pending Exam)',
                            assignedIds,
                            checkedAssigned,
                            handleToggleAssignedCheck,
                            <Button fullWidth variant="outlined" size="small" color="warning" onClick={handleUnassignSelected} disabled={checkedAssigned.size === 0 || isSubmitting} startIcon={<ArrowBackIcon />}>Unassign ({checkedAssigned.size})</Button>, // Changed color to warning
                            'warning' // Changed color accent
                        )}
                    </Grid>
                    {/* Column 3: Taken */}
                    <Grid item xs={12} md={2}>
                        {renderStudentList(
                            'Exam Taken',
                            takenIds,
                            new Set(), // No checks needed
                            () => {},  // No toggle action
                            null,      // No button needed
                            'success'
                        )}
                    </Grid>
                </Grid>
            )}

            {/* Save Button */}
            {!isLoadingData && selectedExam && currentExamDetails && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" size="large" onClick={handleSaveAssignments} disabled={isLoadingData || isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>
            )}

             {/* Placeholder if no exam selected */}
             {!selectedExam && !isLoadingExams && availableExams.length > 0 && <Typography sx={{ color: 'text.secondary', mt: 2 }}>Please select an exam to view and manage assignments.</Typography>}
             {!isLoadingExams && availableExams.length === 0 && !error && <Typography sx={{ color: 'text.secondary', mt: 2 }}>No exams have been created yet.</Typography>}

            {/* Success Snackbar */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                message={successMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default AssignExamPage;