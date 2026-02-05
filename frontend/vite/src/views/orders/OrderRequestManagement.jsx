import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Fade,
  InputAdornment,
  Autocomplete,
  IconButton,
  Tooltip,
  Pagination
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { IconBuildingStore, IconSearch, IconClipboardList } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { useToast } from '../../utils/toast.jsx';

const statusConfig = {
  all: { label: 'All Order Requests', color: 'default' },
  pending: { label: 'Pending Order Requests', color: 'warning' },
  confirmed: { label: 'Confirmed Order Requests', color: 'success' },
  waiting: { label: 'Waiting Order Requests', color: 'info' },
  completed: { label: 'Completed Order Requests', color: 'primary' },
  rejected: { label: 'Rejected Order Requests', color: 'error' },
  cancelled: { label: 'Cancelled Order Requests', color: 'error' }
};

export default function OrderRequestManagement() {
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const { status } = useParams();
  
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ restaurantId: 'all', name: 'All Restaurants' });
  const [searchTerm, setSearchTerm] = useState('');
  const [orderRequests, setOrderRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalCount: 0, totalPages: 0 });

  useEffect(() => {
    fetchRestaurantNames();
  }, []);

  useEffect(() => {
    fetchOrderRequests();
  }, [selectedRestaurant, status, pagination.page]);

  const fetchRestaurantNames = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setRestaurants([{ restaurantId: 'all', name: 'All Restaurants' }, ...result.data]);
      }
    } catch (error) {
      console.error('Error fetching restaurant names:', error);
      toast.error('Failed to fetch restaurants');
    }
  };

  const fetchOrderRequests = async () => {
    try {
      setLoading(true);
      const endpoint = !status || status === 'all' ? 'all' : status;
      
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/order-requests/${endpoint}?page=${pagination.page}&limit=${pagination.limit}`;
      
      // Only add restaurantId if it's not 'all'
      if (selectedRestaurant?.restaurantId && selectedRestaurant.restaurantId !== 'all') {
        url += `&restaurantId=${selectedRestaurant.restaurantId}`;
      }
      
      const response = await fetch(url, { credentials: 'include' });
      const result = await response.json();
      
      if (result.success) {
        setOrderRequests(result.data);
        setPagination(prev => ({
          ...prev,
          totalCount: result.pagination?.totalCount || 0,
          totalPages: result.pagination?.totalPages || 0
        }));
      } else {
        toast.error(result.message || 'Failed to fetch order requests');
      }
    } catch (error) {
      console.error('Error fetching order requests:', error);
      toast.error('Failed to fetch order requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderRequest = (orderRequest) => {
    navigate(`/order-requests/detail/${orderRequest._id}`);
  };

  const getFilteredOrderRequests = () => {
    let filtered = orderRequests || [];
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.phone?.includes(searchTerm) ||
        order.orderRequestNo?.toString().includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const filteredOrderRequests = getFilteredOrderRequests();
  const currentStatus = statusConfig[status] || statusConfig.all;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (orderStatus) => {
    const config = statusConfig[orderStatus] || { label: orderStatus, color: 'default' };
    return (
      <Chip 
        label={config.label.replace(' Order Requests', '')} 
        color={config.color}
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconClipboardList size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {currentStatus.label}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            View and manage order requests by restaurant
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card 
          sx={{ 
            borderRadius: 3, 
            border: '1px solid #e0e0e0', 
            overflow: 'hidden',
            background: 'white'
          }}
        >
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              <Autocomplete
                sx={{ minWidth: 300 }}
                options={restaurants}
                getOptionLabel={(option) => option.name}
                value={selectedRestaurant}
                onChange={(event, newValue) => {
                  setSelectedRestaurant(newValue || { restaurantId: 'all', name: 'All Restaurants' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Restaurant"
                    placeholder="Search restaurants..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconBuildingStore size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <TextField
                placeholder="Search by customer name, phone, or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Order Request #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items Count</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  {status === 'waiting' && (
                    <TableCell sx={{ fontWeight: 700 }}>Waiting Time</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={status === 'waiting' ? 9 : 8} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading order requests..." />
                    </TableCell>
                  </TableRow>
                ) : filteredOrderRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={status === 'waiting' ? 9 : 8} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconClipboardList size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No order requests found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm ? 'Try adjusting your search' : `No ${status || 'all'} order requests available`}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrderRequests.map((orderRequest, index) => (
                    <Fade in timeout={1200 + index * 100} key={orderRequest._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            #{orderRequest.orderRequestNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {orderRequest.userId?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {orderRequest.userId?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={orderRequest.orderType === 'dine-in' ? 'Dine In' : 'Takeaway'} 
                            color={orderRequest.orderType === 'dine-in' ? 'primary' : 'secondary'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {orderRequest.items?.length || 0} items
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                            ₹{orderRequest.cartTotal?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(orderRequest.status)}
                        </TableCell>
                        {status === 'waiting' && (
                          <TableCell>
                            <Typography variant="body2" color="warning.main" fontWeight="bold">
                              {orderRequest.waitingTime ? `${orderRequest.waitingTime} min` : 'N/A'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(orderRequest.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details" arrow>
                            <IconButton
                              onClick={() => handleViewOrderRequest(orderRequest)}
                              sx={{ 
                                color: 'info.main',
                                borderRadius: 1,
                                '&:hover': {
                                  backgroundColor: 'info.main',
                                  color: 'white',
                                  transform: 'scale(1.08)'
                                }
                              }}
                            >
                              <Visibility sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredOrderRequests.length > 0 && (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(event, value) => setPagination(prev => ({ ...prev, page: value }))}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Card>
      </Fade>
    </Box>
  );
}