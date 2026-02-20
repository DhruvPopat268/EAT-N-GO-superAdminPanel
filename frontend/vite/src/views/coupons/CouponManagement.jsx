import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  alpha,
  useTheme,
  Fade,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  Autocomplete,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import { IconTicket, IconPlus, IconFilterOff } from '@tabler/icons-react';
import axios from 'axios';
import 'utils/apiInterceptor';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import ConfirmDialog from '../../utils/ConfirmDialog.jsx';
import { useToast } from '../../utils/toast.jsx';

export default function CouponManagement() {
  const theme = useTheme();
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewCoupon, setViewCoupon] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    couponCode: '',
    restaurant: null,
    discountType: 'percentage',
    amount: '',
    minOrderTotal: '',
    maxDiscount: '',
    totalUsageLimit: -1,
    userUsageLimit: 1,
    firstOrderOnly: false,
    status: true
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCoupons();
  }, [selectedRestaurant, page, rowsPerPage, debouncedSearchTerm]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`, { withCredentials: true });
      setRestaurants(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
      setRestaurants([]);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      if (selectedRestaurant !== 'all') params.restaurantId = selectedRestaurant;
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/coupons`, {
        params,
        withCredentials: true
      });
      if (response.data.success) {
        setCoupons(response.data.data);
        setTotalCoupons(response.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = () => {
    setEditMode(false);
    setFormData({
      name: '',
      description: '',
      couponCode: '',
      restaurant: null,
      discountType: 'percentage',
      amount: '',
      minOrderTotal: '',
      maxDiscount: '',
      totalUsageLimit: -1,
      userUsageLimit: 1,
      firstOrderOnly: false,
      status: true
    });
    setDialogOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditMode(true);
    setSelectedCoupon(coupon);
    const selectedRestaurantObj = restaurants.find(r => r.restaurantId === coupon.restaurantId?._id);
    
    setFormData({
      name: coupon.name || '',
      description: coupon.description || '',
      couponCode: coupon.couponCode || '',
      restaurant: selectedRestaurantObj || null,
      discountType: coupon.discountType || 'percentage',
      amount: coupon.amount || '',
      minOrderTotal: coupon.minOrderTotal || '',
      maxDiscount: coupon.maxDiscount || '',
      totalUsageLimit: coupon.totalUsageLimit || -1,
      userUsageLimit: coupon.userUsageLimit || 1,
      firstOrderOnly: coupon.firstOrderOnly || false,
      status: coupon.status
    });
    setDialogOpen(true);
  };

  const handleDeleteCoupon = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleViewCoupon = (coupon) => {
    setViewCoupon(coupon);
    setViewDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/coupons/${couponToDelete._id}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setCoupons(prev => prev.filter(item => item._id !== couponToDelete._id));
        toast.success('Coupon deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/coupons/${id}/status`, {
        status: newStatus
      }, { withCredentials: true });
      if (response.data.success) {
        setCoupons(prev => prev.map(item =>
          item._id === id ? { ...item, status: newStatus } : item
        ));
        toast.success(`Coupon ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update coupon status');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const couponData = {
        name: formData.name,
        description: formData.description,
        couponCode: formData.couponCode.toUpperCase(),
        restaurantId: formData.restaurant?.restaurantId,
        discountType: formData.discountType,
        amount: parseFloat(formData.amount),
        minOrderTotal: parseFloat(formData.minOrderTotal) || 0,
        maxDiscount: formData.discountType === 'percentage' ? parseFloat(formData.maxDiscount) || 0 : undefined,
        totalUsageLimit: parseInt(formData.totalUsageLimit) || -1,
        userUsageLimit: parseInt(formData.userUsageLimit) || 1,
        firstOrderOnly: formData.firstOrderOnly,
        status: formData.status
      };

      let response;
      if (editMode) {
        response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/coupons/${selectedCoupon._id}`, couponData, {
          withCredentials: true
        });
      } else {
        response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/coupons`, couponData, {
          withCredentials: true
        });
      }

      if (response.data.success) {
        fetchCoupons();
        setDialogOpen(false);
        toast.success(`Coupon ${editMode ? 'updated' : 'created'} successfully!`);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} coupon`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    const statusMatch = statusFilter === 'all' || coupon.status === statusFilter;
    return statusMatch;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedRestaurant('all');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || selectedRestaurant !== 'all';

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) + '\n' + 
           date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconTicket size={32} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Coupon Management
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Manage discount coupons for restaurants
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={900}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
            <TextField
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 300 }}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconTicket size={20} />
                  </InputAdornment>
                ),
              }}
            />
            {hasActiveFilters && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconFilterOff size={18} />}
                onClick={handleClearFilters}
                sx={{ minWidth: 120 }}
              >
                Clear
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>All Status</InputLabel>
              <Select
                value={statusFilter}
                label="All Status"
                onChange={(e) => {
                  setFilterLoading(true);
                  setStatusFilter(e.target.value);
                  setTimeout(() => setFilterLoading(false), 300);
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAddCoupon}
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Create Coupon
            </Button>
          </Box>
        </Box>
      </Fade>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCoupons.length} of {totalCoupons} coupons
        </Typography>
      </Box>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', background: 'white' }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>COUPON CODE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>NAME</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DISCOUNT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>MIN ORDER</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>USAGE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CREATED AT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>UPDATED AT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading || filterLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading coupons..." />
                    </TableCell>
                  </TableRow>
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconTicket size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No coupons found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Coupon" to create your first coupon
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon, index) => (
                    <Fade in timeout={1200 + index * 100} key={coupon._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            #{index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={coupon.couponCode}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {coupon.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {coupon.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.amount}%` 
                              : `₹${coupon.amount}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ₹{coupon.minOrderTotal}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {coupon.usageCount} / {coupon.totalUsageLimit === -1 ? '∞' : coupon.totalUsageLimit}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={coupon.status}
                              onChange={() => handleStatusToggle(coupon._id, coupon.status)}
                              size="small"
                            />
                            <Chip
                              label={coupon.status ? 'Active' : 'Inactive'}
                              color={coupon.status ? 'success' : 'error'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDate(coupon.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDate(coupon.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Coupon" arrow>
                              <IconButton
                                onClick={() => handleViewCoupon(coupon)}
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
                                <Visibility sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Coupon" arrow>
                              <IconButton
                                onClick={() => handleEditCoupon(coupon)}
                                sx={{
                                  color: 'secondary.main',
                                  borderRadius: 1,
                                  '&:hover': {
                                    backgroundColor: 'secondary.main',
                                    color: 'white',
                                    transform: 'scale(1.08)'
                                  }
                                }}
                              >
                                <Edit sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCoupons}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Fade>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {editMode ? 'Edit Coupon' : 'Add New Coupon'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              fullWidth
              options={restaurants}
              getOptionLabel={(option) => option.name}
              value={formData.restaurant}
              onChange={(event, newValue) => {
                setFormData({ ...formData, restaurant: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Restaurant" required />
              )}
            />

            <TextField
              fullWidth
              label="Coupon Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Coupon Code"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
              required
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.discountType}
                  label="Discount Type"
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Discount Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">
                    {formData.discountType === 'percentage' ? '%' : '₹'}
                  </InputAdornment>,
                }}
                required
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Min Order Total"
                type="number"
                value={formData.minOrderTotal}
                onChange={(e) => setFormData({ ...formData, minOrderTotal: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
              />
              {formData.discountType === 'percentage' && (
                <TextField
                  fullWidth
                  label="Max Discount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Total Usage Limit"
                type="number"
                value={formData.totalUsageLimit}
                onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                helperText="-1 for unlimited"
              />
              {!formData.firstOrderOnly && (
                <TextField
                  fullWidth
                  label="User Usage Limit"
                  type="number"
                  value={formData.userUsageLimit}
                  onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                  helperText="-1 for unlimited"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">First Order Only:</Typography>
              <Switch
                checked={formData.firstOrderOnly}
                onChange={(e) => {
                  const isFirstOrder = e.target.checked;
                  setFormData({ 
                    ...formData, 
                    firstOrderOnly: isFirstOrder,
                    userUsageLimit: isFirstOrder ? 1 : formData.userUsageLimit
                  });
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">Status:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  size="small"
                />
                <Chip
                  label={formData.status ? 'Active' : 'Inactive'}
                  color={formData.status ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.couponCode || !formData.restaurant || !formData.amount || !formData.minOrderTotal}
            sx={{ borderRadius: 2, px: 3 }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Coupon Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {viewCoupon && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Coupon Code</Typography>
                <Chip
                  label={viewCoupon.couponCode}
                  color="primary"
                  sx={{ fontWeight: 'bold', fontFamily: 'monospace', mt: 0.5 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight="bold">{viewCoupon.name}</Typography>
              </Box>

              {viewCoupon.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{viewCoupon.description}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Discount Type</Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                    {viewCoupon.discountType}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Discount Amount</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewCoupon.discountType === 'percentage' ? `${viewCoupon.amount}%` : `₹${viewCoupon.amount}`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Min Order Total</Typography>
                  <Typography variant="body1" fontWeight="bold">₹{viewCoupon.minOrderTotal}</Typography>
                </Box>
                {viewCoupon.maxDiscount > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">Max Discount</Typography>
                    <Typography variant="body1" fontWeight="bold">₹{viewCoupon.maxDiscount}</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Total Usage Limit</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewCoupon.totalUsageLimit === -1 ? 'Unlimited' : viewCoupon.totalUsageLimit}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">User Usage Limit</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewCoupon.userUsageLimit === -1 ? 'Unlimited' : viewCoupon.userUsageLimit}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Usage Count</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {viewCoupon.usageCount} / {viewCoupon.totalUsageLimit === -1 ? '∞' : viewCoupon.totalUsageLimit}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">First Order Only</Typography>
                  <Chip
                    label={viewCoupon.firstOrderOnly ? 'Yes' : 'No'}
                    color={viewCoupon.firstOrderOnly ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip
                    label={viewCoupon.status ? 'Active' : 'Inactive'}
                    color={viewCoupon.status ? 'success' : 'error'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">
                    {new Date(viewCoupon.createdAt).toLocaleString('en-GB')}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Updated At</Typography>
                  <Typography variant="body2">
                    {new Date(viewCoupon.updatedAt).toLocaleString('en-GB')}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete the coupon"
        itemName={couponToDelete?.couponCode}
        loading={deleting}
      />

      {/* Toast Notifications */}
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
}
