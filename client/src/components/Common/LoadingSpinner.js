import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const LoadingSpinner = ({ size = 40 }) => { // Optional size prop
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh', // Take up viewport height
         // p: 3, // Add some padding
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;