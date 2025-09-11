// src/components/Admin/ExamForm.js
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs'; // Ensure dayjs adapter is setup in index.js
import { createExam, updateExamAdmin } from '../../api/exams';
import { getAllQuestions } from '../../api/questions';

const ExamForm = ({ initialData, onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [startTime, setStartTime] = useState(null); // Represents Dayjs object or null
    // const [endTime, setEndTime] = useState(null); // Add if using endTime
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    const isEditing = !!initialData;

    // --- Fetch Available Questions (No Changes) ---
    const fetchAvailableQuestions = useCallback(async () => {
        setIsLoadingQuestions(true); setError('');
        try {
            const { success, data } = await getAllQuestions();
            if (success) setAvailableQuestions(data || []); else setError('Could not load questions for selection.');
        } catch (err) { setError(err.response?.data?.message || 'Error fetching questions.'); console.error("fetch questions error:", err); }
        finally { setIsLoadingQuestions(false); }
    }, []);
    useEffect(() => { fetchAvailableQuestions(); }, [fetchAvailableQuestions]);

    // --- Pre-populate Form (No Changes Needed from previous correction) ---
    useEffect(() => {
        if (isEditing && initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setDuration(initialData.duration?.toString() || '');
            setStartTime(initialData.startTime ? dayjs(initialData.startTime) : null);
            // setEndTime(initialData.endTime ? dayjs(initialData.endTime) : null);
             const initialQuestionIds = initialData.questions?.map(q => typeof q === 'string' ? q : q._id) || [];
             if(availableQuestions.length > 0){ // Ensure questions are loaded before filtering
                 const matchingQuestions = availableQuestions.filter(q => initialQuestionIds.includes(q._id));
                setSelectedQuestions(matchingQuestions);
             }
        } else {
             setTitle(''); setDescription(''); setDuration(''); setStartTime(null); // setEndTime(null);
             setSelectedQuestions([]); setError('');
        }
     }, [initialData, isEditing, availableQuestions]);

    // --- Handle Question Selection (No Changes) ---
    const handleQuestionSelection = (event, newValue) => setSelectedQuestions(newValue || []);

    // --- Handle Form Submit (Corrected Validation & Data Sending) ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Clear previous errors

        // --- Corrected Frontend Validation ---
        let isValid = true;
        if (!title.trim()) { setError("Title is required."); isValid = false; }
        if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) { setError("Valid duration (minutes) required."); isValid = false; }
        if (!selectedQuestions || selectedQuestions.length === 0) { setError("Select at least one question."); isValid = false; }

        // Validate startTime ONLY IF it's not null
        if (startTime !== null && !dayjs(startTime).isValid()) {
            setError("Start time format is invalid."); isValid = false;
        }
        // Prevent past dates ONLY when CREATING (allow editing past dates if needed)
        if (startTime !== null && dayjs(startTime).isValid() && !isEditing && dayjs(startTime).isBefore(dayjs())) {
             setError("Start time cannot be in the past for new exams."); isValid = false;
        }
         // Add similar validation for endTime if used
         // if (endTime !== null && !dayjs(endTime).isValid()) { ... }
         // if (startTime !== null && endTime !== null && dayjs(endTime).isBefore(dayjs(startTime))) { ... }

         if (!isValid) { return; } // Stop submission if validation fails

        // --- Prepare Data for API ---
         setIsLoading(true);
        const examData = {
            title: title.trim(),
            description: description.trim(), // Send empty string if description is empty
            duration: parseInt(duration),
            questions: selectedQuestions.map(q => q._id),
            // *** CORRECTLY SEND ISO string or NULL ***
             startTime: startTime && dayjs(startTime).isValid() ? dayjs(startTime).toISOString() : null,
             // endTime: endTime && dayjs(endTime).isValid() ? dayjs(endTime).toISOString() : null, // If using endTime
             // Ensure assignedTo is handled: Preserve existing if editing, empty if creating
             assignedTo: isEditing ? (initialData?.assignedTo?.map(s => typeof s === 'string' ? s : s._id) || []) : []
        };

         console.log("Frontend: Submitting Exam Data:", examData); // Log the data being sent

        try {
            if (isEditing) {
                await updateExamAdmin(initialData._id, examData);
            } else {
                await createExam(examData);
            }
             // Reset loading state FIRST
            setIsLoading(false);
            if (onSuccess) onSuccess(); // Call success callback AFTER loading state is false

        } catch (err) {
            // Always set loading false in case of error
            setIsLoading(false);
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} exam.`);
            console.error("Exam form submission error:", err);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            <Grid container spacing={2}>
                 {/* Title, Desc, Duration */}
                 <Grid item xs={12}><TextField label="Exam Title *" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} margin="dense" disabled={isLoading} error={!!error && !title.trim()} helperText={!!error && !title.trim() ? 'Title is required' : ''} /></Grid>
                 <Grid item xs={12}><TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} margin="dense" disabled={isLoading} /></Grid>
                 <Grid item xs={12} sm={6}><TextField label="Duration (minutes) *" fullWidth required type="number" value={duration} onChange={(e) => setDuration(e.target.value)} InputProps={{ inputProps: { min: 1 } }} margin="dense" disabled={isLoading} error={!!error && (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0)} helperText={!!error && (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) ? 'Valid duration required' : ''} /></Grid>

                 {/* START TIME Picker */}
                <Grid item xs={12} sm={6}>
                     <DateTimePicker
                         label="Exam Start Time (Optional)"
                         value={startTime}
                         onChange={(newValue) => setStartTime(newValue)}
                         // Allow editing past dates, prevent future only for *new* exams
                         minDateTime={isEditing ? undefined : dayjs()}
                         ampm={false}
                         slotProps={{
                             textField: {
                                 fullWidth: true,
                                 margin: "dense",
                                 // Error if a value exists but is invalid
                                  error: !!error && startTime !== null && !dayjs(startTime).isValid(),
                                  helperText: !!error && startTime !== null && !dayjs(startTime).isValid() ? 'Invalid date/time format' : ''
                             }
                         }}
                         disabled={isLoading}
                     />
                </Grid>

                 {/* Optional END TIME Picker */}
                {/* <Grid item xs={12} sm={6}> <DateTimePicker ... /> </Grid> */}


                 {/* Question Selector */}
                 <Grid item xs={12}>
                     <Autocomplete multiple id="question-select" options={availableQuestions} getOptionLabel={(o) => o.questionText || ''} value={selectedQuestions} onChange={handleQuestionSelection} isOptionEqualToValue={(o, v) => o._id === v._id} loading={isLoadingQuestions} disabled={isLoading || isLoadingQuestions} disableCloseOnSelect renderOption={(p, o, { selected }) => (<li {...p}><Checkbox sx={{mr:1}} checked={selected}/>{o.questionText}</li>)} renderTags={(v, gp) => v.map((o, i) => (<Chip variant="outlined" label={`${o.questionText.substring(0,25)}...`} size="small" {...gp({ index: i })} key={o._id} /> ))} renderInput={(params) => ( <TextField {...params} label="Select Questions *" required placeholder="Choose..." margin="dense" InputProps={{ ...params.InputProps, endAdornment: (<>{isLoadingQuestions ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>) }} error={!!error && (!selectedQuestions || selectedQuestions.length === 0)} helperText={!!error && (!selectedQuestions || selectedQuestions.length === 0) ? 'Select at least one question': ''}/> )}/>
                     <Typography variant="caption">{selectedQuestions.length} questions selected.</Typography>
                </Grid>

             </Grid>

            {/* Submit Buttons */}
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {onCancel && <Button onClick={onCancel} disabled={isLoading} sx={{ mr: 1 }} color="secondary">Cancel</Button> }
                 <Button type="submit" variant="contained" disabled={isLoading || isLoadingQuestions} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}> {isEditing ? 'Update Exam' : 'Create Exam'} </Button>
            </Box>
        </Box>
    );
};

ExamForm.propTypes = {
    initialData: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func,
};

export default ExamForm;