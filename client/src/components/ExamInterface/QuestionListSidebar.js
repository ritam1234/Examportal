import React from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CircleIcon from '@mui/icons-material/Circle'; // Unanswered
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Answered
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'; // Current
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const QuestionListSidebar = ({ questions = [], currentIndex, onQuestionSelect, answers = {} }) => {
    const getStatusIcon = (index, questionId) => {
        if (index === currentIndex) {
             return <RadioButtonCheckedIcon fontSize="small" color="primary"/>; // Current question
        }
        if (answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== '') {
             return <CheckCircleIcon fontSize="small" color="success" />; // Answered question
        }
        return <CircleIcon fontSize="small" sx={{ color: 'action.disabled' }} />; // Unanswered
    };

    return (
        <Box>
             <Typography variant="subtitle1" sx={{ p: 1, fontWeight: 'bold', textAlign: 'center' }}>Questions</Typography>
            <Divider />
            <List dense disablePadding> {/* Dense for more items */}
                {questions.map((question, index) => (
                    <ListItemButton
                         key={question._id || index}
                         selected={index === currentIndex}
                        onClick={() => onQuestionSelect(index)}
                        sx={{
                             py: 0.5, // Reduce vertical padding
                             borderLeft: index === currentIndex ? '4px solid' : 'none',
                             borderLeftColor: 'primary.main'
                         }}
                     >
                        <ListItemIcon sx={{ minWidth: 30 }}> {/* Reduce icon spacing */}
                             {getStatusIcon(index, question._id)}
                        </ListItemIcon>
                        <ListItemText primary={`Q ${index + 1}`} primaryTypographyProps={{ variant: 'body2' }}/>
                    </ListItemButton>
                ))}
            </List>
         </Box>
    );
};

QuestionListSidebar.propTypes = {
    questions: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        // questionText maybe useful here later?
    })).isRequired,
    currentIndex: PropTypes.number.isRequired,
    onQuestionSelect: PropTypes.func.isRequired,
    answers: PropTypes.object.isRequired, // Map of { questionId: selectedOption }
};

export default QuestionListSidebar;