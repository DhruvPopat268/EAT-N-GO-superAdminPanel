import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmColor = 'error',
  loading = false
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color={`${confirmColor}.main`}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {message}
          {itemName && <strong> "{itemName}"</strong>}?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Deleting...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;