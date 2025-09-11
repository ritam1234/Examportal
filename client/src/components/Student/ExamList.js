// src/components/Student/ExamList.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Divider from '@mui/material/Divider';
import CountdownTimer from '../ExamInterface/CountdownTimer'; // Import countdown
import dayjs from 'dayjs';

// Individual Exam Item Component
const ExamListItem = ({ exam }) => {
    const [canStart, setCanStart] = useState(false);
    const startTime = exam.startTime ? dayjs(exam.startTime) : null;
    const isValidStartTime = startTime && startTime.isValid();

    useEffect(() => {
        let intervalId = null;
        // Check initially and set interval only if needed
        const checkStartTime = () => {
            if (isValidStartTime && dayjs().isAfter(startTime)) {
                setCanStart(true);
                if (intervalId) clearInterval(intervalId); // Stop checking once it can start
            } else if (isValidStartTime) {
                 setCanStart(false); // Ensure it's false if time hasn't passed
            } else {
                // If no valid startTime, maybe it can be started anytime? Or show error?
                 // For now, let's assume invalid/missing start time means cannot start (or handle differently)
                 setCanStart(false);
            }
        };

        checkStartTime(); // Initial check

         // Set up interval only if start time is valid and in the future
         if (isValidStartTime && !canStart && dayjs().isBefore(startTime)) {
             intervalId = setInterval(checkStartTime, 5000); // Check every 5 seconds
        }

        // Cleanup interval on unmount
        return () => {
             if (intervalId) clearInterval(intervalId);
        };
    }, [startTime, isValidStartTime, canStart]); // Rerun effect if startTime changes

    const handleCountdownEnd = () => {
        // When countdown component finishes, mark as ready to start
         setCanStart(true);
    };

     return (
         <ListItem
             divider
             secondaryAction={
                 isValidStartTime && !canStart && dayjs().isBefore(startTime) ? (
                     // Render Countdown Timer
                     <CountdownTimer
                         targetTime={startTime}
                         onEnd={handleCountdownEnd}
                         compact={true} // Use compact style
                      />
                 ) : (
                     // Render Start Button (disabled if cannot start)
                      <Button
                         variant="contained"
                          size="small"
                         color="primary"
                          startIcon={<PlayCircleOutlineIcon />}
                          component={RouterLink}
                          to={`/exam/${exam._id}`}
                         disabled={!canStart} // Disable based on state
                          title={!canStart ? (isValidStartTime ? 'Exam has not started yet' : 'Exam start time not available') : 'Start Exam'}
                      >
                         Start Exam
                      </Button>
                  )
             }
             sx={{py: 1.5}} // Add padding
         >
              <ListItemText
                  primary={exam.title}
                  secondary={
                      isValidStartTime
                      ? `Starts: ${startTime.format('DD MMM YYYY, h:mm A')} | Duration: ${exam.duration} mins`
                       : `Duration: ${exam.duration} mins (Start time TBD)`
                  }
                   primaryTypographyProps={{fontWeight: 'medium'}}
              />
         </ListItem>
     );
 }

 // Main Exam List Component
const ExamList = ({ exams = [], isLoading = false }) => {
    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>;
    }

    if (!exams || exams.length === 0) {
        return <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign:'center' }}>No pending exams found.</Typography>;
    }

    return (
        // Use disablePadding on List and add Divider inside map for better control
        <List disablePadding>
            {exams.map((exam, index) => (
                 <ExamListItem key={exam._id || index} exam={exam} />
                // No divider here, handled within ExamListItem now
             ))}
         </List>
    );
};

ExamList.propTypes = {
    exams: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]), // Should be Date string from API
        questions: PropTypes.array,
    })),
    isLoading: PropTypes.bool,
};

export default ExamList;