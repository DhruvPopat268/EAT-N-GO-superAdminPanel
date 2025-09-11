import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const BlackSpinner = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%'
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: '#000000'
        }}
      />
    </Box>
  );
};

export default BlackSpinner;