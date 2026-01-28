import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import { IconArrowLeft, IconPrinter, IconUser, IconBuildingStore, IconShoppingCart } from '@tabler/icons-react';
import ThemeSpinner from '../../ui-component/ThemeSpinner.jsx';

const getStatusChip = (status) => {
  const statusConfig = {
    confirmed: { bgcolor: '#4CAF50', borderColor: '#4CAF50', textColor: 'white' },
    waiting: { bgcolor: '#FF9800', borderColor: '#FF9800', textColor: 'white' },
    preparing: { bgcolor: '#2196F3', borderColor: '#2196F3', textColor: 'white' },
    ready: { bgcolor: '#9C27B0', borderColor: '#9C27B0', textColor: 'white' },
    served: { bgcolor: '#1976D2', borderColor: '#1976D2', textColor: 'white' },
    completed: { bgcolor: '#2E7D32', borderColor: '#2E7D32', textColor: 'white' },
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

const InfoCard = ({ icon, title, children, bgColor = "#f8f9fa" }) => (
  <Card sx={{ p: 3, height: '100%', bgcolor: bgColor, border: '1px solid #e0e0e0' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box sx={{ width: 32, height: 32, bgcolor: '#64748b', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="medium">{title}</Typography>
    </Box>
    {children}
  </Card>
);

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const restaurantId = searchParams.get('restaurantId');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(
        `${baseUrl}/api/orders/detail/${id}?restaurantId=${restaurantId}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimings = (timings) => {
    if (!timings) return 'N/A';
    return `${timings.startTime} - ${timings.endTime}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <ThemeSpinner message="Loading order details..." />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Order not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => navigate(-1)}
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: '#f1f5f9', 
                  '&:hover': { bgcolor: '#e2e8f0' } 
                }}
              >
                <IconArrowLeft size={20} />
              </IconButton>
              <Box>
                <Typography variant="h5" fontWeight="semibold">Order Details</Typography>
                <Typography variant="body2" color="text.secondary">Order details and management</Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={() => window.print()}
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: '#f1f5f9', 
                '&:hover': { bgcolor: '#e2e8f0' } 
              }}
            >
              <IconPrinter size={20} />
            </IconButton>
          </Box>
        </Card>

        {/* Order Summary */}
        <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
          <Box sx={{ bgcolor: '#64748b', color: 'white', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="semibold">Order #{order.orderNo}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {formatDate(order.createdAt)}
                </Typography>
              </Box>
              {getStatusChip(order.status)}
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Customer Info */}
              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={<IconUser size={16} color="white" />}
                  title="Customer Information"
                  bgColor="#eff6ff"
                >
                  <Box sx={{ space: 2 }}>
                    <Typography variant="h6" fontWeight="medium" color="black">
                      {order.userId?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                      📞 {order.userId?.phone || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                      🍽️ {order.orderType?.replace('-', ' ').toUpperCase() || 'N/A'}
                    </Typography>
                    {order.numberOfGuests && (
                      <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                        👥 Guests: {order.numberOfGuests}
                      </Typography>
                    )}
                    <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                      ⏰ {formatTimings(order.eatTimings)}
                    </Typography>
                    {order.dineInstructions && (
                      <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                        📝 {order.dineInstructions}
                      </Typography>
                    )}
                  </Box>
                </InfoCard>
              </Grid>

              {/* Order Info */}
              <Grid item xs={12} md={6}>
                <InfoCard
                  icon={<IconBuildingStore size={16} color="white" />}
                  title="Order Information"
                  bgColor="#f0fdf4"
                >
                  <Box sx={{ space: 2 }}>
                    <Typography variant="body2" color="black">
                      💳 Payment: {order.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                      💰 Total: ₹{order.totalAmount}
                    </Typography>
                    {order.waitingTime && (
                      <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                        ⏱️ Waiting Time: {order.waitingTime} min
                      </Typography>
                    )}
                    <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                      📅 Created: {formatDate(order.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 1 }}>
                      🔄 Updated: {formatDate(order.updatedAt)}
                    </Typography>
                  </Box>
                </InfoCard>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Order Items */}
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconShoppingCart size={20} />
              <Typography variant="h6" fontWeight="semibold">Order Items</Typography>
            </Box>
          </Box>

          <Box sx={{ divide: '1px solid #f1f5f9' }}>
            {order.items?.map((item, index) => (
              <Box key={item._id} sx={{ p: 3, borderBottom: index < order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Avatar 
                    src={item.itemId?.images?.[0]} 
                    sx={{ width: 80, height: 80, borderRadius: 2 }}
                    variant="rounded"
                  >
                    🍽️
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="medium" color="black">
                      {item.itemId?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 0.5 }}>
                      {item.itemId?.description || 'No description'}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 0.5 }}>
                      Category: {item.itemId?.category} | {item.itemId?.subcategory?.name}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 0.5 }}>
                      Quantity: {item.quantity} | Size: {item.selectedAttribute?.name}
                    </Typography>
                    <Typography variant="body2" color="black" sx={{ mt: 0.5 }}>
                      Food Type: {item.selectedFoodType}
                    </Typography>
                    
                    {/* Customizations */}
                    {item.selectedCustomizations?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="black" fontWeight="medium">Customizations:</Typography>
                        {item.selectedCustomizations.map((custom, idx) => (
                          <Typography key={idx} variant="body2" color="black" sx={{ ml: 1 }}>
                            • {custom.customizationName}: {custom.selectedOptions?.map(opt => `${opt.optionName} (${opt.quantity})`).join(', ')}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    
                    {/* Addons */}
                    {item.selectedAddons?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="black" fontWeight="medium">Addons:</Typography>
                        {item.selectedAddons.map((addon, idx) => (
                          <Typography key={idx} variant="body2" color="black" sx={{ ml: 1 }}>
                            • {addon.addonId?.name} ({addon.selectedAttribute?.name}) - Qty: {addon.quantity}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="bold" color="black">
                      ₹{item.itemTotal}
                    </Typography>
                    {item.customizationTotal > 0 && (
                      <Typography variant="body2" color="black">
                        Customizations: ₹{item.customizationTotal}
                      </Typography>
                    )}
                    {item.addonsTotal > 0 && (
                      <Typography variant="body2" color="black">
                        Addons: ₹{item.addonsTotal}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Order Total */}
          <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Order Request Total</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ₹{order.orderTotal || order.totalAmount}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}