import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const BlueSpinner = ({ size = 40, message = "Loading combos..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%'
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: '#1976d2'
        }}
      />
      <Typography variant="body2" sx={{ mt: 2 }}>{message}</Typography>
    </Box>
  );
};

export default BlueSpinner;