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
  Stack,
  alpha,
  useTheme,
  Fade,
  InputAdornment,
  Autocomplete,
  IconButton,
  Tooltip,
  TablePagination,
  Button
} from '@mui/material';
import { Visibility, CheckCircle } from '@mui/icons-material';
import { IconBuildingStore, IconSearch, IconCircleCheck, IconFilterOff, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { useToast } from '../../utils/toast.jsx';
import { formatDateTime } from '../../utils/dateFormatter.js';

export default function ConfirmedOrderRequests() {
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ restaurantId: 'all', name: 'All Restaurants' });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedOrderType, setSelectedOrderType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orderRequests, setOrderRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const orderTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'dine-in', label: 'Dine In' },
    { value: 'takeaway', label: 'Takeaway' }
  ];

  useEffect(() => {
    fetchRestaurantNames();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchOrderRequests();
  }, [selectedRestaurant, page, rowsPerPage, debouncedSearchTerm, selectedOrderType, startDate, endDate]);

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
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/order-requests/confirmed?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (selectedRestaurant?.restaurantId && selectedRestaurant.restaurantId !== 'all') {
        url += `&restaurantId=${selectedRestaurant.restaurantId}`;
      }
      
      if (debouncedSearchTerm.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm.trim())}`;
      }
      
      if (selectedOrderType) {
        url += `&orderType=${selectedOrderType}`;
      }
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      
      if (endDate) {
        url += `&endDate=${endDate}`;
      }
      
      const response = await fetch(url, { credentials: 'include' });
      const result = await response.json();
      
      if (result.success) {
        setOrderRequests(result.data);
        setTotalCount(result.pagination?.totalCount || 0);
      } else {
        toast.error(result.message || 'Failed to fetch confirmed order requests');
      }
    } catch (error) {
      console.error('Error fetching order requests:', error);
      toast.error('Failed to fetch confirmed order requests');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRestaurant({ restaurantId: 'all', name: 'All Restaurants' });
    setSelectedOrderType('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || selectedRestaurant?.restaurantId !== 'all' || selectedOrderType || startDate || endDate;

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

  const getOrderTypeChip = (orderType) => {
    return (
      <Chip 
        label={orderType === 'dine-in' ? 'Dine In' : 'Takeaway'} 
        color={orderType === 'dine-in' ? 'primary' : 'secondary'}
        variant="filled"
        size="small"
        icon={orderType === 'dine-in' ? <CheckCircle sx={{ fontSize: 16 }} /> : undefined}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconCircleCheck size={32} color="#4CAF50" />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Confirmed Order Requests
            </Typography>
            <Chip 
              label={`${filteredOrderRequests.length} Confirmed`}
              sx={{ 
                bgcolor: '#4CAF50',
                color: 'white',
                border: '1px solid #4CAF50',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
              size="small"
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Order requests confirmed by restaurants and ready for customer payment
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search by customer name, phone, or order number..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 400 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchTerm('');
                            setPage(0);
                          }}
                        >
                          <IconX size={18} />
                        </IconButton>
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
                <Autocomplete
                  sx={{ minWidth: 220 }}
                  options={restaurants}
                  getOptionLabel={(option) => option.name}
                  value={selectedRestaurant}
                  onChange={(event, newValue) => {
                    setSelectedRestaurant(newValue || { restaurantId: 'all', name: 'All Restaurants' });
                    setPage(0);
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

                <Autocomplete
                  sx={{ minWidth: 150 }}
                  options={orderTypeOptions}
                  getOptionLabel={(option) => option.label}
                  value={orderTypeOptions.find(option => option.value === selectedOrderType) || orderTypeOptions[0]}
                  onChange={(event, newValue) => {
                    setSelectedOrderType(newValue?.value || '');
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Order Type"
                      placeholder="Select type..."
                    />
                  )}
                />
                
                <TextField
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 140 }}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 140 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Stack>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.success.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3, textAlign: 'center' }}>Order No</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>User Info</TableCell>
                  {selectedRestaurant?.restaurantId === 'all' && <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Restaurant</TableCell>}
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Timings</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Items</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Waiting Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order Req Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>CreatedAt</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Updated At</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 12 : 11} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading confirmed order requests..." />
                    </TableCell>
                  </TableRow>
                ) : filteredOrderRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 12 : 11} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconCircleCheck size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No confirmed order requests
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm ? 'Try adjusting your search' : 'No order requests have been confirmed yet'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrderRequests.map((orderRequest, index) => (
                    <Fade in timeout={1200 + index * 100} key={orderRequest._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.02) } }}>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            #{orderRequest.orderRequestNo}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="black">
                              {orderRequest.userId?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="black">
                              {orderRequest.userId?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        {selectedRestaurant?.restaurantId === 'all' && (
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="black">
                              {orderRequest.restaurantId?.basicInfo?.restaurantName || 'N/A'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label={orderRequest.orderType === 'dine-in' ? 'Dine In' : 'Takeaway'} 
                            sx={{ color: 'black', border: 'none', backgroundColor: 'transparent' }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box>
                            {orderRequest.orderType === 'dine-in' ? (
                              <>
                                <Typography variant="body2" color="black">
                                  Eating: {orderRequest.eatTimings?.startTime} - {orderRequest.eatTimings?.endTime}
                                </Typography>
                                <Typography variant="body2" color="black">
                                  Guests: {orderRequest.numberOfGuests}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" color="black">
                                Pickup: {orderRequest.takeawayTimings?.startTime} - {orderRequest.takeawayTimings?.endTime}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {orderRequest.items?.length || 0} 
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label="Confirmed"
                            sx={{ 
                              bgcolor: '#4CAF50',
                              color: 'white',
                              border: '1px solid #4CAF50',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {orderRequest.waitingTime?.startTime && orderRequest.waitingTime?.endTime ? `${orderRequest.waitingTime.startTime} - ${orderRequest.waitingTime.endTime}` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            ₹{orderRequest.cartTotal?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDateTime(orderRequest.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDateTime(orderRequest.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="View Details" arrow>
                            <IconButton
                              onClick={() => navigate(`/order-requests/detail/${orderRequest._id}`)}
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

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      </Fade>
    </Box>
  );
}
