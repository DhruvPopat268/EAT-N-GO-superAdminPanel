import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  useTheme,
  Fade,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { IconQrcode, IconCreditCard } from '@tabler/icons-react';

// Mock UPI data
const mockUPIData = [
  {
    id: 1,
    upiId: 'restaurant@paytm',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=restaurant@paytm&pn=Restaurant&cu=INR',
    isActive: true
  },
  {
    id: 2,
    upiId: 'food@gpay',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=food@gpay&pn=Food&cu=INR',
    isActive: true
  },
  {
    id: 3,
    upiId: 'delivery@phonepe',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=delivery@phonepe&pn=Delivery&cu=INR',
    isActive: false
  }
];

export default function UPIManagement() {
  const theme = useTheme();
  const [upiData, setUpiData] = useState(mockUPIData);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedUPI, setSelectedUPI] = useState(null);
  const [formData, setFormData] = useState({ upiId: '' });

  const handleAdd = () => {
    setDialogMode('add');
    setFormData({ upiId: '' });
    setOpenDialog(true);
  };

  const handleEdit = (upi) => {
    setDialogMode('edit');
    setSelectedUPI(upi);
    setFormData({ upiId: upi.upiId });
    setOpenDialog(true);
  };

  const handleView = (upi) => {
    setDialogMode('view');
    setSelectedUPI(upi);
    setFormData({ upiId: upi.upiId });
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    setUpiData(upiData.filter(upi => upi.id !== id));
  };

  const handleSave = () => {
    if (dialogMode === 'add') {
      const newUPI = {
        id: Math.max(...upiData.map(u => u.id)) + 1,
        upiId: formData.upiId,
        qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${formData.upiId}&pn=Payment&cu=INR`,
        isActive: true
      };
      setUpiData([...upiData, newUPI]);
    } else if (dialogMode === 'edit') {
      setUpiData(upiData.map(upi => 
        upi.id === selectedUPI.id 
          ? { 
              ...upi, 
              upiId: formData.upiId,
              qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${formData.upiId}&pn=Payment&cu=INR`
            }
          : upi
      ));
    }
    setOpenDialog(false);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedUPI(null);
    setFormData({ upiId: '' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCreditCard size={32} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                UPI Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{ borderRadius: 2 }}
            >
              Add UPI
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage UPI payment methods and QR codes
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 0, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h6" fontWeight="bold">
              UPI Payment Methods
            </Typography>
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Index</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>QR Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>UPI ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upiData.map((upi, index) => (
                  <TableRow key={upi.id} sx={{ '&:hover': { backgroundColor: theme.palette.grey[25] } }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={upi.qrImage}
                        alt="QR Code"
                        sx={{ width: 60, height: 60, borderRadius: 1 }}
                        variant="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500">
                        {upi.upiId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View UPI Details" arrow>
                          <IconButton
                            onClick={() => handleView(upi)}
                            sx={{ 
                              color: 'primary.main',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                transform: 'scale(1.08)'
                              }
                            }}
                          >
                            <Visibility sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit UPI" arrow>
                          <IconButton
                            onClick={() => handleEdit(upi)}
                            sx={{ 
                              color: 'warning.main',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'warning.main',
                                color: 'white',
                                transform: 'scale(1.08)'
                              }
                            }}
                          >
                            <Edit sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete UPI" arrow>
                          <IconButton
                            onClick={() => handleDelete(upi.id)}
                            sx={{ 
                              color: 'error.main',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'white',
                                transform: 'scale(1.08)'
                              }
                            }}
                          >
                            <Delete sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>

      {/* Dialog for Add/Edit/View */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add UPI' : dialogMode === 'edit' ? 'Edit UPI' : 'View UPI Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="UPI ID"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                disabled={dialogMode === 'view'}
                placeholder="Enter UPI ID (e.g., user@paytm)"
              />
            </Grid>
            {(dialogMode === 'view' || dialogMode === 'edit') && selectedUPI && (
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  QR Code Preview
                </Typography>
                <Avatar
                  src={selectedUPI.qrImage}
                  alt="QR Code"
                  sx={{ width: 150, height: 150, borderRadius: 2, mx: 'auto' }}
                  variant="rounded"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {dialogMode !== 'view' && (
            <Button 
              onClick={handleSave} 
              variant="contained"
              disabled={!formData.upiId.trim()}
            >
              {dialogMode === 'add' ? 'Add' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}