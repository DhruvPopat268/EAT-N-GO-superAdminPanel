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
  Switch,
  Chip,
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
  TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MainCard from 'ui-component/cards/MainCard';
import { useToast } from 'utils/toast.jsx';
import axios from 'axios';

const Configuration = () => {
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [editData, setEditData] = useState({
    flatPercentageDiscountOnFinalBill: 0,
    coverChargePerPerson: 0
  });
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch restaurants data
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/table-reservation-config`, {
        params,
        withCredentials: true
      });
      if (response.data.success) {
        setRestaurants(response.data.data);
        setTotalCount(response.data.pagination?.totalCount || 0);
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

  // Toggle table reservation booking status
  const handleToggleBooking = async (restaurantId, currentStatus) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/table-reservation-booking`, {
        restaurantId,
        tableReservationBooking: !currentStatus
      },{withCredentials: true});

      if (response.data.success) {
        toast.success('Table reservation booking status updated successfully');
        fetchRestaurants(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Error updating booking status');
    }
  };

  // Open edit dialog
  const handleEditConfig = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditData({
      flatPercentageDiscountOnFinalBill: restaurant.tableReservationBookingConfig.flatPercentageDiscountOnFinalBill || 0,
      coverChargePerPerson: restaurant.tableReservationBookingConfig.coverChargePerPerson || 0
    });
    setEditDialog(true);
  };

  // Update configuration
  const handleUpdateConfig = async () => {
    try {
      setUpdating(true);
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/admin/table-reservation-config`, {
        restaurantId: selectedRestaurant.restaurantId,
        flatPercentageDiscountOnFinalBill: parseFloat(editData.flatPercentageDiscountOnFinalBill),
        coverChargePerPerson: parseFloat(editData.coverChargePerPerson)
      },{withCredentials: true});

      if (response.data.success) {
        toast.success('Configuration updated successfully');
        setEditDialog(false);
        fetchRestaurants(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Error updating configuration');
    } finally {
      setUpdating(false);
    }
  };

  // Close edit dialog
  const handleCloseDialog = () => {
    setEditDialog(false);
    setSelectedRestaurant(null);
    setEditData({
      flatPercentageDiscountOnFinalBill: 0,
      coverChargePerPerson: 0
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

  if (loading) {
    return (
      <MainCard title="Table Booking Configuration">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Table Booking Configuration">
      <Box sx={{ mb: 2 }}>
        <Alert severity="info">
          Manage table reservation booking settings for all restaurants. Toggle booking status and configure admin discount for user final bill and cover charge per person.
        </Alert>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Restaurant Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="center">Booking Status</TableCell>
              <TableCell align="center">Admin Discount</TableCell>
              <TableCell align="center">Cover Charge Per Person</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {restaurants.map((restaurant, index) => (
              <TableRow key={restaurant.restaurantId}>
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
                  <Switch
                    checked={restaurant.tableReservationBooking}
                    onChange={() => handleToggleBooking(restaurant.restaurantId, restaurant.tableReservationBooking)}
                    color="primary"
                  />
                  <Chip
                    label={restaurant.tableReservationBooking ? 'Enabled' : 'Disabled'}
                    color={restaurant.tableReservationBooking ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: '#000' }}>
                    {restaurant.tableReservationBookingConfig.flatPercentageDiscountOnFinalBill}%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: '#000' }}>
                    ₹{restaurant.tableReservationBookingConfig.coverChargePerPerson}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditConfig(restaurant)}
                  >
                    Edit Config
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

      {/* Edit Configuration Dialog */}
      <Dialog open={editDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EditIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Update Configuration - {selectedRestaurant?.restaurantName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure discount and cover charge settings
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Admin Discount for User Final Bill (%)"
                type="number"
                value={editData.flatPercentageDiscountOnFinalBill}
                onChange={(e) => setEditData({
                  ...editData,
                  flatPercentageDiscountOnFinalBill: e.target.value
                })}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                helperText="Enter admin discount percentage (0-100)"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cover Charge Per Person (₹)"
                type="number"
                value={editData.coverChargePerPerson}
                onChange={(e) => setEditData({
                  ...editData,
                  coverChargePerPerson: e.target.value
                })}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Enter cover charge amount in rupees"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
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
            onClick={handleUpdateConfig}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={updating}
            sx={{ borderRadius: 2 }}
          >
            {updating ? 'Updating...' : 'Update Configuration'}
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

      
    </MainCard>
  );
};

export default Configuration;