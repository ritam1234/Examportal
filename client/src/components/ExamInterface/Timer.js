import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Clock icon

const Timer = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime); // time in seconds
  const timerRef = useRef(null); // Ref to store interval ID

  useEffect(() => {
    // Start timer only if initialTime is greater than 0
    if (initialTime > 0) {
       setTimeLeft(initialTime); // Initialize time left

      // Clear any existing interval before starting a new one
      if (timerRef.current) {
           clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
           setTimeLeft((prevTime) => {
               if (prevTime <= 1) { // When time reaches 1 second (to avoid displaying 0)
                   clearInterval(timerRef.current); // Clear interval
                  if (onTimeUp) {
                       onTimeUp(); // Trigger time up callback
                  }
                   return 0; // Set time to 0
               }
               return prevTime - 1; // Decrement time
          });
       }, 1000); // Update every second
     }

     // Cleanup function: clear interval when component unmounts or initialTime changes
     return () => {
         if (timerRef.current) {
              clearInterval(timerRef.current);
         }
     };
  }, [initialTime, onTimeUp]); // Rerun effect if initialTime or onTimeUp changes

  // Format time (HH:MM:SS or MM:SS)
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

     if (hours > 0) {
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
     } else {
         return `${formattedMinutes}:${formattedSeconds}`;
     }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <AccessTimeIcon sx={{ mr: 1, color: timeLeft < 60 ? 'error.main' : 'inherit' }} /> {/* Color red if < 1 min */}
      <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', color: timeLeft < 60 ? 'error.main' : 'inherit' }}>
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );
};

Timer.propTypes = {
  initialTime: PropTypes.number.isRequired, // Time in seconds
  onTimeUp: PropTypes.func.isRequired,    // Callback function when timer reaches 0
};

export default Timer;