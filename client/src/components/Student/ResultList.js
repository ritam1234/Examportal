import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ResultList = ({ results = [], isLoading = false }) => {

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>;
    }

    if (results.length === 0) {
        return <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>You have not completed any exams yet.</Typography>;
    }

    return (
        <List disablePadding>
            {results.map((result) => (
                 <ListItem
                    key={result._id}
                    divider
                    secondaryAction={
                        <Button
                            variant="outlined"
                             size="medium"
                            color="secondary"
                            startIcon={<VisibilityIcon />}
                            component={RouterLink}
                             // Link to detailed result view - check App.js route
                             to={`/results/${result._id}`}
                        >
                            View Details
                        </Button>
                    }
                 >
                    <ListItemText
                         // Ensure backend populated exam title or handle gracefully
                         primary={result.exam?.title || 'Exam Result'}
                         secondary={`Score: ${result.score}/${result.totalQuestions} (${result.percentage.toFixed(1)}%) | Submitted: ${new Date(result.submittedAt).toLocaleDateString()}`}
                     />
                 </ListItem>
             ))}
         </List>
    );
};

ResultList.propTypes = {
    results: PropTypes.arrayOf(PropTypes.shape({
         _id: PropTypes.string.isRequired,
         exam: PropTypes.shape({
             _id: PropTypes.string,
             title: PropTypes.string,
         }),
         score: PropTypes.number.isRequired,
         totalQuestions: PropTypes.number.isRequired,
         percentage: PropTypes.number.isRequired,
         submittedAt: PropTypes.string.isRequired,
     })),
    isLoading: PropTypes.bool,
};

export default ResultList;