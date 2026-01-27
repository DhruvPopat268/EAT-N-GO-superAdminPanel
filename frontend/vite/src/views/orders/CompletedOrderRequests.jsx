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
  TablePagination
} from '@mui/material';
import { Visibility, CheckCircleOutline, Receipt } from '@mui/icons-material';
import { IconBuildingStore, IconSearch, IconCircleCheckFilled } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { useToast } from '../../utils/toast.jsx';

export default function CompletedOrderRequests() {
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ restaurantId: 'all', name: 'All Restaurants' });
  const [searchTerm, setSearchTerm] = useState('');
  const [orderRequests, setOrderRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchRestaurantNames();
    fetchOrderRequests();
  }, []);

  useEffect(() => {
    fetchOrderRequests();
  }, [selectedRestaurant, page, rowsPerPage]);

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
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/order-requests/completed?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (selectedRestaurant?.restaurantId && selectedRestaurant.restaurantId !== 'all') {
        url += `&restaurantId=${selectedRestaurant.restaurantId}`;
      }
      
      const response = await fetch(url, { credentials: 'include' });
      const result = await response.json();
      
      if (result.success) {
        setOrderRequests(result.data);
        setTotalCount(result.pagination?.totalCount || 0);
      } else {
        toast.error(result.message || 'Failed to fetch completed order requests');
      }
    } catch (error) {
      console.error('Error fetching order requests:', error);
      toast.error('Failed to fetch completed order requests');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionTime = (createdAt, updatedAt) => {
    const created = new Date(createdAt);
    const completed = new Date(updatedAt);
    const diffInMinutes = Math.floor((completed - created) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}m`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconCircleCheckFilled size={32} color="#009688" />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Completed Order Requests
            </Typography>
            <Chip 
              label={`${filteredOrderRequests.length} Completed`}
              sx={{ 
                bgcolor: '#009688',
                color: 'white',
                border: '1px solid #009688',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
              size="small"
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Successfully completed order requests with final orders placed
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              <Autocomplete
                sx={{ minWidth: 300 }}
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
                  <TableCell sx={{ fontWeight: 700, py: 3, textAlign: 'center' }}>Order No</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>User Info</TableCell>
                  {selectedRestaurant?.restaurantId === 'all' && <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Restaurant</TableCell>}
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Timings</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Items</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Waiting Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order Req Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order Req Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 11 : 10} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading completed order requests..." />
                    </TableCell>
                  </TableRow>
                ) : filteredOrderRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 11 : 10} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconCircleCheckFilled size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No completed order requests
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm ? 'Try adjusting your search' : 'No order requests have been completed yet'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrderRequests.map((orderRequest, index) => (
                    <Fade in timeout={1200 + index * 100} key={orderRequest._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
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
                            label="Completed"
                            sx={{ 
                              bgcolor: '#009688',
                              color: 'white',
                              border: '1px solid #009688',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {orderRequest.waitingTime ? `${orderRequest.waitingTime} min` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            ₹{orderRequest.orderTotal?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {formatDate(orderRequest.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Order Request" arrow>
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
                            {orderRequest.finalOrderId && (
                              <Tooltip title="View Final Order" arrow>
                                <IconButton
                                  onClick={() => navigate(`/order/detail/${orderRequest.finalOrderId}`)}
                                  sx={{ 
                                    color: 'success.main',
                                    borderRadius: 1,
                                    '&:hover': {
                                      backgroundColor: 'success.main',
                                      color: 'white',
                                      transform: 'scale(1.08)'
                                    }
                                  }}
                                >
                                  <Receipt sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
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