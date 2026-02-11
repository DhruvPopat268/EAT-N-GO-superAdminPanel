import { useState, useEffect } from 'react';
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
import { IconEye, IconBuildingStore, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { formatDateTime } from '../../utils/dateFormatter.js';

const BaseOrderManagement = ({ title, status, apiEndpoint }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ restaurantId: 'all', name: 'All Restaurants' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrderType, setSelectedOrderType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'served', label: 'Served' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const orderTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'dine-in', label: 'Dine In' },
    { value: 'takeaway', label: 'Takeaway' }
  ];

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/restaurantNames`,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      if (data.success) {
        setRestaurants([{ restaurantId: 'all', name: 'All Restaurants' }, ...data.data]);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = apiEndpoint || '/all';
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/orders${endpoint}?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (selectedRestaurant?.restaurantId && selectedRestaurant.restaurantId !== 'all') {
        url += `&restaurantId=${selectedRestaurant.restaurantId}`;
      }
      
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
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
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        setTotalCount(data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, selectedRestaurant, searchTerm, selectedStatus, selectedOrderType, startDate, endDate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    const statusConfig = {
      confirmed: { bgcolor: '#4CAF50', borderColor: '#4CAF50', textColor: 'white' }, // green
      waiting: { bgcolor: '#FF9800', borderColor: '#FF9800', textColor: 'white' }, // yellow
      preparing: { bgcolor: '#2196F3', borderColor: '#2196F3', textColor: 'white' }, // blue (info)
      ready: { bgcolor: '#9C27B0', borderColor: '#9C27B0', textColor: 'white' }, // purple/secondary
      served: { bgcolor: '#1976D2', borderColor: '#1976D2', textColor: 'white' }, // primary (blue/brand)
      completed: { bgcolor: '#2E7D32', borderColor: '#2E7D32', textColor: 'white' }, // deep green
      cancelled: { bgcolor: '#9E9E9E', borderColor: '#9E9E9E', textColor: 'white' }, // grey
      refunded: { bgcolor: '#F44336', borderColor: '#F44336', textColor: 'white' } // red
    };
    
    return statusConfig[status] || statusConfig.waiting;
  };

  const getStatusChip = (status) => {
    const config = getStatusColor(status);
    return (
      <Chip 
        label={status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
        sx={{ 
          bgcolor: config.bgcolor,
          color: config.textColor,
          border: `1px solid ${config.borderColor}`,
          fontSize: '0.75rem',
          fontWeight: 500
        }}
        size="small"
      />
    );
  };



  const formatTimings = (timings) => {
    if (!timings) return '-';
    return `${timings.startTime} - ${timings.endTime}`;
  };

  const handleViewOrder = (orderId, restaurantId) => {
    navigate(`/orders/detail/${orderId}?restaurantId=${restaurantId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            {title}
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
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
                }}
              />
              
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

                {status === 'all' && (
                  <Autocomplete
                    sx={{ minWidth: 150 }}
                    options={statusOptions}
                    getOptionLabel={(option) => option.label}
                    value={statusOptions.find(option => option.value === selectedStatus) || statusOptions[0]}
                    onChange={(event, newValue) => {
                      setSelectedStatus(newValue?.value || '');
                      setPage(0);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Status"
                        placeholder="Select status..."
                      />
                    )}
                  />
                )}

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
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3, textAlign: 'center' }}>Order No</TableCell>
                  {selectedRestaurant?.restaurantId === 'all' && <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Restaurant</TableCell>}
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>User Info</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Order Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Eat/Takeaway Timings</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Waiting Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Payment Method</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Updated At</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 12 : 11} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading orders..." />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 12 : 11} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, index) => (
                    <Fade in timeout={1200 + index * 100} key={order._id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            #{order.orderNo}
                          </Typography>
                        </TableCell>
                        {selectedRestaurant?.restaurantId === 'all' && (
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="black">
                              {order.restaurantId?.basicInfo?.restaurantName || 'N/A'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="black">
                              {order.userId?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="black">
                              {order.userId?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label={order.orderType?.replace('-', ' ').toUpperCase() || 'N/A'} 
                            sx={{ color: 'black', border: 'none', backgroundColor: 'transparent' }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {formatTimings(order.eatTimings)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {order.waitingTime?.startTime && order.waitingTime?.endTime ? `${order.waitingTime.startTime} - ${order.waitingTime.endTime}` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label={order.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'} 
                            sx={{ color: 'black', border: 'none', backgroundColor: 'transparent' }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            ₹{order.totalAmount}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {getStatusChip(order.status)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDateTime(order.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDateTime(order.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="View Order">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewOrder(order._id, order.restaurantId?._id || order.restaurantId)}
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
                              <IconEye />
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
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Fade>
    </Box>
  );
};

export default BaseOrderManagement;
