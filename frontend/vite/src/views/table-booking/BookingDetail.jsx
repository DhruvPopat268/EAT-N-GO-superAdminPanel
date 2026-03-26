import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  useTheme,
  IconButton,
  Stack,
  alpha,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { useToast } from '../../utils/toast.jsx';
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

export default function BookingDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const bookingId = searchParams.get('bookingId');
  const restaurantId = searchParams.get('restaurantId');

  useEffect(() => {
    if (bookingId && restaurantId) {
      fetchBookingDetail();
    }
  }, [bookingId, restaurantId]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/table-bookings/detail?bookingId=${bookingId}&restaurantId=${restaurantId}`,
        {
          credentials: 'include'
        }
      );
      const result = await response.json();
      
      if (result.success) {
        setBooking(result.data);
        toast.success('Booking details loaded successfully');
      } else {
        toast.error(result.message || 'Failed to fetch booking details');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { bgcolor: '#FF9800', borderColor: '#FF9800', textColor: 'white' },
      confirmed: { bgcolor: '#4CAF50', borderColor: '#4CAF50', textColor: 'white' },
      arrived: { bgcolor: '#2196F3', borderColor: '#2196F3', textColor: 'white' },
      seated: { bgcolor: '#9C27B0', borderColor: '#9C27B0', textColor: 'white' },
      completed: { bgcolor: '#2E7D32', borderColor: '#2E7D32', textColor: 'white' },
      cancelled: { bgcolor: '#9E9E9E', borderColor: '#9E9E9E', textColor: 'white' },
      notArrived: { bgcolor: '#F44336', borderColor: '#F44336', textColor: 'white' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <ThemeSpinner message="Loading booking details..." />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Booking not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', p: 3 }}>
      <Box sx={{ maxWidth: '80rem', mx: 'auto' }}>
        
        {/* Header */}
        <Card sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate(-1)}
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: alpha(theme.palette.grey[100], 0.8),
                  '&:hover': { bgcolor: alpha(theme.palette.grey[200], 0.8) }
                }}
              >
                <ArrowBack sx={{ fontSize: 20, color: theme.palette.grey[600] }} />
              </IconButton>
              <Box>
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  Booking #{booking.tableBookingNo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Table booking detail and management
                </Typography>
              </Box>
            </Box>
            {getStatusChip(booking.status)}
          </Box>
        </Card>

        {/* Main Content - Side by Side Layout */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Booking Information - Left Side */}
          <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', height: 'fit-content', width: '350px', flexShrink: 0 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
                Booking Information
              </Typography>
              
              <Stack spacing={2.5}>
                {/* Restaurant */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Restaurant
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {booking.restaurantId?.basicInfo?.restaurantName || 'N/A'}
                  </Typography>
                </Box>

                {/* Customer */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color="text.primary">
                    {booking.userId?.fullName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {booking.userId?.phone || 'N/A'}
                  </Typography>
                  {booking.userId?.email && (
                    <Typography variant="body2" color="text.secondary">
                      {booking.userId.email}
                    </Typography>
                  )}
                </Box>

                {/* Booking Date & Time */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Booking Date
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {formatDateToDDMMYY(booking.bookingTimings?.date)}
                  </Typography>
                </Box>

                {/* Slot Time */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Slot Time
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {formatTimeTo12Hour(booking.bookingTimings?.slotTime)}
                  </Typography>
                </Box>

                {/* Number of Guests */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Number of Guests
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {booking.numberOfGuests}
                  </Typography>
                </Box>

                {/* Special Instructions */}
                {booking.specialInstructions && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Special Instructions
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {booking.specialInstructions}
                    </Typography>
                  </Box>
                )}

                <Divider />

                {/* Cover Charges */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Cover Charges
                  </Typography>
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#00a63e' }}>
                    {booking.currency?.symbol || '₹'}{booking.coverCharges}
                  </Typography>
                </Box>

                {/* Payment Status */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Payment Status
                  </Typography>
                  {getPaymentStatusChip(booking.coverChargePaymentStatus)}
                </Box>

                {/* Payment ID */}
                {booking.coverChargePaymentId && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Payment ID
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ wordBreak: 'break-all' }}>
                      {booking.coverChargePaymentId}
                    </Typography>
                  </Box>
                )}

                <Divider />

                {/* Created At */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Created At
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {formatDateTime(booking.createdAt).replace('\n', ' - ')}
                  </Typography>
                </Box>

                {/* Updated At */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                    Updated At
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {formatDateTime(booking.updatedAt).replace('\n', ' - ')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>

          {/* Offer & Table Details - Right Side */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Offer Details */}
            {booking.offer && (
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Offer Details
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Offer Name
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="text.primary">
                        {booking.offer.offerName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                          Restaurant Discount
                        </Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={500}>
                          {booking.offer.restaurantOfferPercentageOnBill}%
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                          Admin Discount
                        </Typography>
                        <Typography variant="body1" color="text.primary" fontWeight={500}>
                          {booking.offer.adminOfferPercentageOnBill}%
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            )}

            {/* Allocated Tables */}
            {booking.allocatedTables && Array.isArray(booking.allocatedTables) && booking.allocatedTables.length > 0 && (
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Allocated Tables
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {booking.allocatedTables.map((allocation, index) => (
                      <Box 
                        key={allocation._id || index}
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: alpha('#4CAF50', 0.05),
                          border: '1px solid #4CAF50'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Table Numbers
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Allocated: {formatDateTime(allocation.allocatedAt).replace('\n', ' - ')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {allocation.tableNumbers?.map((tableNum, idx) => (
                            <Chip
                              key={idx}
                              label={`Table ${tableNum}`}
                              size="small"
                              sx={{
                                bgcolor: '#4CAF50',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>
            )}

            {/* Allocated Tables - Object Format */}
            {booking.allocatedTables && !Array.isArray(booking.allocatedTables) && booking.allocatedTables.tableNumbers?.length > 0 && (
              <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Allocated Tables
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha('#4CAF50', 0.05),
                      border: '1px solid #4CAF50'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Table Numbers
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Allocated: {formatDateTime(booking.allocatedTables.allocatedAt).replace('\n', ' - ')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {booking.allocatedTables.tableNumbers.map((tableNum, idx) => (
                        <Chip
                          key={idx}
                          label={`Table ${tableNum}`}
                          size="small"
                          sx={{
                            bgcolor: '#4CAF50',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Card>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
