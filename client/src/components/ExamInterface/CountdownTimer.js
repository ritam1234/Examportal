// src/components/ExamInterface/CountdownTimer.js (or create ListCountdownTimer.js)
// Can reuse the existing one, or make a compact variant
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip'; // Added for better UX on compact display
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // Import duration plugin

dayjs.extend(duration); // Extend dayjs with the duration plugin

const CountdownTimer = ({ targetTime, onEnd, compact = false }) => { // Added compact prop
    const timerRef = useRef(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    // Calculate initial remaining duration immediately
    const calculateDuration = useCallback(() => {
        const now = dayjs();
        const end = dayjs(targetTime);
        if (!end.isValid() || end.isBefore(now)) {
            return dayjs.duration(0);
        }
        return dayjs.duration(end.diff(now));
    }, [targetTime]);

    const [remainingDuration, setRemainingDuration] = useState(calculateDuration);

    useEffect(() => {
        const end = dayjs(targetTime);
        // Set initial time up state correctly
        const initiallyUp = !end.isValid() || end.isBefore(dayjs());
         setIsTimeUp(initiallyUp);

        if (initiallyUp) {
             if (timerRef.current) clearInterval(timerRef.current); // Clear if already up
             setRemainingDuration(dayjs.duration(0)); // Ensure duration is zero
             // Potentially call onEnd immediately if it wasn't called by previous logic
             // onEnd(); // Careful: this might trigger too often on initial render/re-render
             return; // Don't start interval if already time up
        }

        // Function to update the duration state
         const tick = () => {
            const newDuration = calculateDuration();
             setRemainingDuration(newDuration);
             if (newDuration.asMilliseconds() <= 0) {
                setIsTimeUp(true);
                if (onEnd) onEnd();
                if (timerRef.current) clearInterval(timerRef.current);
            }
        };

         // Initial tick and set interval
         tick(); // Calculate immediately
         timerRef.current = setInterval(tick, 1000);

         // Cleanup
         return () => {
             if (timerRef.current) clearInterval(timerRef.current);
        };

      // Re-run effect ONLY if targetTime changes
      // Note: calculateDuration and onEnd should be stable if wrapped in useCallback correctly
     }, [targetTime, onEnd, calculateDuration]);


    // Format the remaining duration
    const formatDuration = (dur) => {
         if (!dur || dur.asMilliseconds() <= 0) {
            return compact ? "0s" : "00d 00h 00m 00s";
         }

         const days = Math.floor(dur.asDays());
         const hours = dur.hours();
         const minutes = dur.minutes();
         const seconds = dur.seconds();

         if (compact) {
              if (days > 0) return `${days}d ${hours}h`;
              if (hours > 0) return `${hours}h ${minutes}m`;
              if (minutes > 0) return `${minutes}m ${seconds}s`;
              return `${seconds}s`;
         } else {
             return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
         }
     };

    const formattedTime = formatDuration(remainingDuration);

     if (compact) {
         return (
             <Tooltip title={`Starts in ${formattedTime}`} placement="top">
                 <Box sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'default' }}>
                     <AccessTimeIcon sx={{ mr: 0.5, fontSize: 'inherit', color: 'text.secondary' }} />
                     <Typography variant="caption" component="span" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                        {formattedTime}
                     </Typography>
                 </Box>
            </Tooltip>
         );
     } else {
          // Existing larger format (from previous ExamPage version)
         return (
             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                 <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                    {formattedTime}
                </Typography>
             </Box>
        );
    }
};

CountdownTimer.propTypes = {
    targetTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date), PropTypes.object]).isRequired,
    onEnd: PropTypes.func.isRequired,
    compact: PropTypes.bool, // New prop for compact style
};

export default CountdownTimer;