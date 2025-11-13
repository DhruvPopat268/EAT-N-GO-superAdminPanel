import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const ThemeSpinner = ({ size = 40, message = "Loading..." }) => {
  const theme = useTheme();
  
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
          color: theme.palette.primary.main
        }}
      />
      <Typography variant="body2" sx={{ mt: 2 }}>{message}</Typography>
    </Box>
  );
};

export default ThemeSpinner;