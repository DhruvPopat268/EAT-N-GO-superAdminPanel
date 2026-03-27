import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  TablePagination,
  Chip,
  Card,
  CardContent,
  Avatar,
  Stack,
  alpha,
  useTheme,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PercentIcon from '@mui/icons-material/Percent';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useToast } from 'utils/toast.jsx';

const CommissionManagement = () => {
  const theme = useTheme();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [editData, setEditData] = useState({
    orderCommission: 0,
    tableBookingCommission: 0
  });
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);



  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/commission?page=${page + 1}&limit=${rowsPerPage}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data);
        setTotalCount(data.pagination.totalCount);
      } else {
        toast.error('Failed to fetch restaurants data');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Error fetching restaurants data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [page, rowsPerPage]);

  const handleEditCommission = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditData({
      orderCommission: restaurant.adminCommission.orderCommission,
      tableBookingCommission: restaurant.adminCommission.tableBookingCommission
    });
    setEditDialog(true);
  };

  const handleUpdateCommission = async () => {
    try {
      setUpdating(true);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          restaurantId: selectedRestaurant.restaurantId,
          orderCommission: parseFloat(editData.orderCommission),
          tableBookingCommission: parseFloat(editData.tableBookingCommission)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Commission updated successfully');
        setEditDialog(false);
        fetchRestaurants();
      } else {
        toast.error(data.message || 'Error updating commission');
      }
    } catch (error) {
      console.error('Error updating commission:', error);
      toast.error('Error updating commission');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseDialog = () => {
    setEditDialog(false);
    setSelectedRestaurant(null);
    setEditData({
      orderCommission: 0,
      tableBookingCommission: 0
    });
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: 'white',
              width: 64,
              height: 64,
            }}
          >
            <PercentIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Commission Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage commission rates for orders and table bookings
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Table */}
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Box
          sx={{
            p: 4,
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Restaurant Commission Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure commission rates for orders and table bookings
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Restaurant</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>Orders Commission</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>Table Commission</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {restaurants.map((restaurant, index) => (
                <TableRow
                  key={restaurant.restaurantId}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      transform: 'translateX(4px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {page * rowsPerPage + index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ color: '#000', fontWeight: 'normal' }}>
                      {restaurant.restaurantName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#000' }}>
                      {restaurant.city}, {restaurant.state}, {restaurant.country}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: '#000' }}>
                      {restaurant.adminCommission.orderCommission}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: '#000' }}>
                      {restaurant.adminCommission.tableBookingCommission}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditCommission(restaurant)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Edit Commission Dialog */}
      <Dialog open={editDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PercentIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Update Commission - {selectedRestaurant?.restaurantName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set commission percentage and select applicable services
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // ✅ center horizontally
              gap: 3,
              mt: 1,
            }}
          >
            {/* Order Commission */}
            <TextField
              size="small"
              label="Order Commission (%)"
              type="number"
              value={editData.orderCommission}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  orderCommission: e.target.value,
                })
              }
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Enter order commission percentage (0-100)"
              FormHelperTextProps={{ sx: { minHeight: 20, textAlign: "left" } }}
              sx={{
                width: 320,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ShoppingCartIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Table Booking Commission */}
            <TextField
              size="small"
              label="Table Booking Commission (%)"
              type="number"
              value={editData.tableBookingCommission}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  tableBookingCommission: e.target.value,
                })
              }
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Enter table booking commission percentage (0-100)"
              FormHelperTextProps={{ sx: { minHeight: 20, textAlign: "left" } }}
              sx={{
                width: 320,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TableRestaurantIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateCommission}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={updating}
            sx={{ borderRadius: 2 }}
          >
            {updating ? 'Updating...' : 'Update Commission'}
          </Button>
        </DialogActions>
      </Dialog>

      {toast.toasts.map((toastItem) => (
        <Snackbar
          key={toastItem.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 2 }}
        >
          <Alert
            severity={toastItem.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 300,
              fontWeight: 500
            }}
          >
            {toastItem.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default CommissionManagement;