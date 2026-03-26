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
  TablePagination,
  Button
} from '@mui/material';
import { IconEye, IconBuildingStore, IconSearch, IconFilterOff, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { formatDateTime } from '../../utils/dateFormatter.js';

// Function to convert 24-hour time to 12-hour format with AM/PM
const formatTimeTo12Hour = (time) => {
  if (!time) return 'N/A';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Function to format date to DD/MM/YY
const formatDateToDDMMYY = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const Bookings = () => {
  const theme = useTheme();
  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({ restaurantId: 'all', name: 'All Restaurants' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'arrived', label: 'Arrived' },
    { value: 'seated', label: 'Seated' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'notArrived', label: 'Not Arrived' }
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

  const fetchSlots = async (restaurantId) => {
    if (!restaurantId || restaurantId === 'all') {
      setSlots([]);
      return;
    }
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/table-bookings/slots/${restaurantId}`,
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        const formattedSlots = data.data.map(slot => ({
          value: slot,
          label: formatTimeTo12Hour(slot)
        }));
        setSlots(formattedSlots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/table-bookings?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (selectedRestaurant?.restaurantId && selectedRestaurant.restaurantId !== 'all') {
        url += `&restaurantId=${selectedRestaurant.restaurantId}`;
      }
      
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
      }
      
      if (selectedSlot) {
        url += `&slot=${selectedSlot}`;
      }
      
      if (debouncedSearchTerm.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm.trim())}`;
      }
      
      if (startDate && endDate) {
        url += `&date=${JSON.stringify({ startDate, endDate })}`;
      } else if (startDate) {
        url += `&date=${JSON.stringify({ startDate })}`;
      } else if (endDate) {
        url += `&date=${JSON.stringify({ endDate })}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.data.bookings);
        setTotalCount(data.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant?.restaurantId) {
      fetchSlots(selectedRestaurant.restaurantId);
    }
  }, [selectedRestaurant]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [page, rowsPerPage, selectedRestaurant, selectedStatus, selectedSlot, debouncedSearchTerm, startDate, endDate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSelectedRestaurant({ restaurantId: 'all', name: 'All Restaurants' });
    setSelectedStatus('');
    setSelectedSlot('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || selectedRestaurant?.restaurantId !== 'all' || selectedStatus || selectedSlot || startDate || endDate;

  const getStatusColor = (status) => {
    const statusConfig = {
      pending: { bgcolor: '#FF9800', borderColor: '#FF9800', textColor: 'white' },
      confirmed: { bgcolor: '#4CAF50', borderColor: '#4CAF50', textColor: 'white' },
      arrived: { bgcolor: '#2196F3', borderColor: '#2196F3', textColor: 'white' },
      seated: { bgcolor: '#9C27B0', borderColor: '#9C27B0', textColor: 'white' },
      completed: { bgcolor: '#2E7D32', borderColor: '#2E7D32', textColor: 'white' },
      cancelled: { bgcolor: '#9E9E9E', borderColor: '#9E9E9E', textColor: 'white' },
      notArrived: { bgcolor: '#F44336', borderColor: '#F44336', textColor: 'white' }
    };
    
    return statusConfig[status] || statusConfig.pending;
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

  const getPaymentStatusChip = (status) => {
    const config = status === 'paid' 
      ? { bgcolor: '#4CAF50', textColor: 'white' }
      : { bgcolor: '#F44336', textColor: 'white' };
    
    return (
      <Chip 
        label={status?.toUpperCase() || 'UNKNOWN'}
        sx={{ 
          bgcolor: config.bgcolor,
          color: config.textColor,
          fontSize: '0.75rem',
          fontWeight: 500
        }}
        size="small"
      />
    );
  };

  const handleViewBooking = (bookingId, restaurantId) => {
    navigate(`/table-booking/detail?bookingId=${bookingId}&restaurantId=${restaurantId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Table Bookings
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="space-between">
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search by booking no, user name, phone..."
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
                    )
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
                    setSelectedSlot('');
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

                {slots.length > 0 && (
                  <Autocomplete
                    sx={{ minWidth: 150 }}
                    options={[{ value: '', label: 'All Slots' }, ...slots]}
                    getOptionLabel={(option) => option.label}
                    value={[{ value: '', label: 'All Slots' }, ...slots].find(option => option.value === selectedSlot) || { value: '', label: 'All Slots' }}
                    onChange={(event, newValue) => {
                      setSelectedSlot(newValue?.value || '');
                      setPage(0);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Slot"
                        placeholder="Select slot..."
                      />
                    )}
                  />
                )}

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

                <TextField
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                  onClick={(e) => e.target.showPicker()}
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
                  onClick={(e) => e.target.showPicker()}
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
                  <TableCell sx={{ fontWeight: 700, py: 3, textAlign: 'center' }}>Booking No</TableCell>
                  {selectedRestaurant?.restaurantId === 'all' && <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Restaurant</TableCell>}
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>User Info</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Booking Timings</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Guests</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Cover Charges</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Payment Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Updated At</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 11 : 10} sx={{ textAlign: 'center', py: 8 }}>
                      <ThemeSpinner message="Loading bookings..." />
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedRestaurant?.restaurantId === 'all' ? 11 : 10} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        No bookings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking, index) => (
                    <Fade in timeout={1200 + index * 100} key={booking._id}>
                      <TableRow sx={{ 
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) }
                      }}>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            #{booking.tableBookingNo}
                          </Typography>
                        </TableCell>
                        {selectedRestaurant?.restaurantId === 'all' && (
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="black">
                              {booking.restaurantId?.basicInfo?.restaurantName || 'N/A'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="black">
                              {booking.userId?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="black">
                              {booking.userId?.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="black">
                              {formatDateToDDMMYY(booking.bookingTimings?.date)}
                            </Typography>
                            <Typography variant="body2" color="black">
                              {formatTimeTo12Hour(booking.bookingTimings?.slotTime)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {booking.numberOfGuests}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black">
                            {booking.currency?.symbol || '₹'}{booking.coverCharges}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {getPaymentStatusChip(booking.coverChargePaymentStatus)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {getStatusChip(booking.status)}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDateTime(booking.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="black" sx={{ whiteSpace: 'pre-line' }}>
                            {formatDateTime(booking.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Tooltip title="View Booking">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewBooking(booking._id, booking.restaurantId?._id || booking.restaurantId)}
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

export default Bookings;