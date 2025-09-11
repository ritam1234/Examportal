import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const QuestionDisplay = ({
    question,
    questionNumber,
    totalQuestions,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrevious,
    isFirst,
    isLast
}) => {
    if (!question) {
        return <Typography>Loading question...</Typography>;
    }

    const handleRadioChange = (event) => {
         // Find the option text corresponding to the selected radio value (which should be the index/key or value)
         onAnswerSelect(question._id, event.target.value); // Pass questionId and selected option VALUE
    };

    return (
        <Card variant="outlined" sx={{ mb: 3 }}> {/* Add bottom margin */}
            <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                     Question {questionNumber} of {totalQuestions}
                 </Typography>
                <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}> {/* Preserve whitespace */}
                     {question.questionText}
                 </Typography>

                 <FormControl component="fieldset" fullWidth>
                     {/* Removed FormLabel "Options" to reduce clutter */}
                     <FormLabel component="legend">Options</FormLabel>
                    <RadioGroup
                        aria-label={`Question ${questionNumber} options`}
                         name={`question_${question._id}_options`}
                         value={selectedAnswer || ''} // Controlled component requires a value, empty string if null/undefined
                         onChange={handleRadioChange}
                     >
                        {question.options.map((option, index) => (
                            <FormControlLabel
                                 key={index}
                                 value={option} // The actual option text is the value
                                 control={<Radio />}
                                label={option}
                                sx={{
                                      mb: 1, // Add spacing between options
                                     p: 1, // Add padding for easier clicking
                                     borderRadius: 1, // Slight rounding
                                      '&:hover': { backgroundColor: 'action.hover' } // Hover effect
                                }}
                             />
                         ))}
                    </RadioGroup>
                 </FormControl>

             </CardContent>

             {/* Navigation Buttons */}
             <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                 <Button
                     variant="outlined"
                     startIcon={<ArrowBackIcon />}
                     onClick={onPrevious}
                    disabled={isFirst}
                 >
                     Previous
                 </Button>
                 <Button
                     variant="contained"
                     endIcon={<ArrowForwardIcon />}
                     onClick={onNext}
                     disabled={isLast}
                 >
                     Next
                 </Button>
            </Box>
        </Card>
    );
};

QuestionDisplay.propTypes = {
    question: PropTypes.shape({
         _id: PropTypes.string.isRequired,
        questionText: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
    questionNumber: PropTypes.number.isRequired,
    totalQuestions: PropTypes.number.isRequired,
    selectedAnswer: PropTypes.string, // The text of the selected option
    onAnswerSelect: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    isFirst: PropTypes.bool.isRequired,
    isLast: PropTypes.bool.isRequired,
};

export default QuestionDisplay;
