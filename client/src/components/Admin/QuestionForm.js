import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { addQuestion, updateQuestion } from '../../api/questions';

const QuestionForm = ({ initialData, onSuccess, onCancel }) => {
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '']); // Start with 2 empty options
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!initialData;

    useEffect(() => {
        if (isEditing) {
            setQuestionText(initialData.questionText || '');
            setOptions(initialData.options || ['', '']);
            setCorrectAnswer(initialData.correctAnswer || '');
        } else {
            // Reset for new question
            setQuestionText('');
            setOptions(['', '']);
            setCorrectAnswer('');
            setError('');
        }
    }, [initialData, isEditing]); // Depend on initialData

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);

        // If the edited option was the correct answer, clear the correct answer selection
        if (options[index] === correctAnswer && value !== correctAnswer) {
            setCorrectAnswer('');
        }
    };

    const handleAddOption = () => {
        if (options.length < 6) { // Limit options for sensibility
            setOptions([...options, '']);
        }
    };

    const handleRemoveOption = (index) => {
         if (options.length <= 2) { // Prevent removing below 2 options
             setError("Must have at least two options.");
             return;
         }
         const removedOptionValue = options[index];
         const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
         // If removed option was the correct one, clear selection
         if (removedOptionValue === correctAnswer) {
              setCorrectAnswer('');
         }
         setError(''); // Clear error if it was about minimum options
    };

    const handleCorrectAnswerChange = (event) => {
        setCorrectAnswer(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        // Validation
        if (!questionText.trim()) {
             setError('Question text cannot be empty.');
             setIsLoading(false);
             return;
        }
         const validOptions = options.filter(opt => opt.trim() !== '').map(opt => opt.trim());
        if (validOptions.length < 2) {
             setError('Must provide at least two non-empty options.');
             setIsLoading(false);
             return;
        }
        if (!correctAnswer || !validOptions.includes(correctAnswer)) {
            setError('Please select a correct answer from the provided options.');
            setIsLoading(false);
            return;
        }

         const questionData = {
            questionText: questionText.trim(),
            options: validOptions,
            correctAnswer: correctAnswer // Already trimmed and validated
        };

        try {
            if (isEditing) {
                await updateQuestion(initialData._id, questionData);
            } else {
                await addQuestion(questionData);
            }
             setIsLoading(false);
             if(onSuccess) onSuccess(); // Notify parent component
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} question.`);
             console.error("Question form error:", err);
             setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
                label="Question Text"
                fullWidth
                required
                multiline
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                margin="normal"
                disabled={isLoading}
            />

             <FormControl component="fieldset" margin="normal" fullWidth disabled={isLoading}>
                <FormLabel component="legend">Options & Correct Answer</FormLabel>
                 <RadioGroup
                     aria-label="correct-answer"
                     name="correctAnswer"
                     value={correctAnswer}
                     onChange={handleCorrectAnswerChange}
                 >
                    {options.map((option, index) => (
                         <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 1 }}>
                             <Grid item xs>
                                <TextField
                                     label={`Option ${index + 1}`}
                                    fullWidth
                                     required
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    variant="outlined"
                                     size="small"
                                    disabled={isLoading}
                                />
                             </Grid>
                            <Grid item>
                                 <FormControlLabel
                                      value={option} // The value bound to the Radio is the option text itself
                                      control={<Radio disabled={!option.trim()} size="small"/>} // Disable radio if option text is empty
                                      label="Correct"
                                      sx={{ ml: 0, mr: -1}} // Adjust spacing
                                     disabled={isLoading}
                                 />
                            </Grid>
                            <Grid item>
                                <IconButton
                                     aria-label="Remove option"
                                    onClick={() => handleRemoveOption(index)}
                                     disabled={options.length <= 2 || isLoading}
                                     color="error"
                                     size="small"
                                >
                                    <DeleteIcon fontSize='small'/>
                                </IconButton>
                            </Grid>
                         </Grid>
                    ))}
                 </RadioGroup>
                 <Button
                    startIcon={<AddCircleIcon />}
                     onClick={handleAddOption}
                     disabled={options.length >= 6 || isLoading} // Example limit
                     size="small"
                      sx={{mt: 1}}
                 >
                    Add Option
                </Button>
            </FormControl>

             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                 {onCancel && (
                    <Button onClick={onCancel} disabled={isLoading} sx={{ mr: 1 }} color="secondary">
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isEditing ? 'Update Question' : 'Add Question'}
                </Button>
            </Box>
        </Box>
    );
};

QuestionForm.propTypes = {
    initialData: PropTypes.object, // Question object for editing, null for adding
    onSuccess: PropTypes.func,   // Callback on successful add/update
    onCancel: PropTypes.func,    // Callback for cancel button
};

export default QuestionForm;
