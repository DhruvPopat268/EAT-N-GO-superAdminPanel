import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  useTheme,
  Fade,
  IconButton,
  Stack,
  alpha,
  Button,
  Divider
} from '@mui/material';
import { ArrowBack, Person, Restaurant, Print, Phone, Email, LocationOn } from '@mui/icons-material';
import { IconClipboardList } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';
import { useToast } from '../../utils/toast.jsx';
import { formatDateTime, formatDate } from '../../utils/dateFormatter.js';

export default function OrderDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const restaurantId = searchParams.get('restaurantId');

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/detail/${id}?restaurantId=${restaurantId}`, {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setOrder(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };



  const getStatusChip = (status) => {
    const statusConfig = {
      confirmed: { bgcolor: '#4CAF50', borderColor: '#4CAF50', textColor: 'white' },
      waiting: { bgcolor: '#FF9800', borderColor: '#FF9800', textColor: 'white' },
      preparing: { bgcolor: '#2196F3', borderColor: '#2196F3', textColor: 'white' },
      ready: { bgcolor: '#9C27B0', borderColor: '#9C27B0', textColor: 'white' },
      served: { bgcolor: '#1976D2', borderColor: '#1976D2', textColor: 'white' },
      completed: { bgcolor: '#009688', borderColor: '#009688', textColor: 'white' },
      cancelled: { bgcolor: '#9E9E9E', borderColor: '#9E9E9E', textColor: 'white' },
      refunded: { bgcolor: '#F44336', borderColor: '#F44336', textColor: 'white' }
    };
    
    const config = statusConfig[status] || statusConfig.waiting;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <ThemeSpinner message="Loading order details..." />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Order not found
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
                  Order #{order.orderNo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  order detail and management
                </Typography>
              </Box>
            </Box>
            {getStatusChip(order.status)}
          </Box>
        </Card>

        {/* Main Content - Side by Side Layout */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Order Information - Left Side */}
          <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', height: 'fit-content', width: '300px', flexShrink: 0 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
                  Order Information
                </Typography>
                
                <Stack spacing={2.5}>
                  {/* Restaurant */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Restaurant
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {order.restaurantId?.basicInfo?.restaurantName || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Customer */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Customer
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                      {order.userId?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.userId?.phone || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Order Type */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Order Type
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {order.orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}
                    </Typography>
                  </Box>

                  {/* Guests (for dine-in) */}
                  {order.orderType === 'dine-in' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Guests
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {order.numberOfGuests}
                      </Typography>
                    </Box>
                  )}

                  {/* Waiting Time */}
                  {order.waitingTime && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Waiting Time
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {order.waitingTime} Mins
                      </Typography>
                    </Box>
                  )}

                  {/* Eat Timings */}
                  {order.orderType === 'dine-in' && order.eatTimings && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Eat Timings
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {order.eatTimings.startTime} - {order.eatTimings.endTime}
                      </Typography>
                    </Box>
                  )}

                  {/* Pickup Timings */}
                  {order.orderType === 'takeaway' && order.takeawayTimings && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Pickup Timings
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {order.takeawayTimings.startTime} - {order.takeawayTimings.endTime}
                      </Typography>
                    </Box>
                  )}

                  {/* Instructions */}
                  {order.dineInstructions && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                        Instructions
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {order.dineInstructions}
                      </Typography>
                    </Box>
                  )}

                  {/* Order Date */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                      Order Req Date
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
          </Card>

          {/* Order Items - Right Side */}
          <Card sx={{ borderRadius: 2, border: '1px solid #e5e7eb', flex: 1 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Order Items
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {order.items?.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      {/* Item Image */}
                      {item.itemId?.images?.[0] && (
                        <Box
                          component="img"
                          src={item.itemId.images[0]}
                          alt={item.itemId?.name}
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            objectFit: 'cover',
                            border: '1px solid #e5e7eb',
                            flexShrink: 0
                          }}
                        />
                      )}
                      
                      {/* Item Details */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" fontWeight={500} color="text.primary">
                            {item.itemId?.name || 'N/A'}
                          </Typography>
                          <Typography variant="h6" fontWeight={600} sx={{ color: '#00a63e' }}>
                            ₹{item.itemTotal || 0}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.itemId?.description || 'Premium quality item'}
                        </Typography>
                        
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            Category: {item.itemId?.subcategory?.name || 'Veg'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity || 1}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Size: {item.selectedAttribute?.name || 'Medium Size'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Food Type: {item.selectedFoodType || 'Regular'}
                          </Typography>
                          
                          {/* Customizations */}
                          {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Customizations:
                              </Typography>
                              {item.selectedCustomizations.map((custom, idx) => (
                                <Box key={idx} sx={{ ml: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {custom.customizationName}:
                                  </Typography>
                                  {custom.selectedOptions?.map((option, optIdx) => (
                                    <Typography key={optIdx} variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                      {option.optionName} ({option.unit}) × {option.quantity}
                                    </Typography>
                                  ))}
                                </Box>
                              ))}
                            </Box>
                          )}
                          
                          {/* Addons */}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Addons:
                              </Typography>
                              {item.selectedAddons.map((addon, idx) => (
                                <Typography key={idx} variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                  • {addon.addonId?.name} ({addon.selectedAttribute?.name}) x{addon.quantity}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                
                {/* Order Total */}
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Order Request Total
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#00a63e' }}>
                      ₹{order.orderTotal || order.totalAmount || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
        </Box>
      </Box>
    </Box>
  );
}