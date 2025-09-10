import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Divider,
  Stack,
  useTheme,
  Fade
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { IconShoppingCartFilled, IconUser, IconMapPin, IconPhone, IconMail, IconClock } from '@tabler/icons-react';

const mockOrderDetails = {
  1: {
    orderNumber: '#ORD001',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    customerEmail: 'john@example.com',
    deliveryAddress: '123 Main St, City, State 12345',
    restaurant: 'Pizza Palace',
    status: 'Delivered',
    orderDate: '2024-01-20',
    orderTime: '14:30',
    deliveryTime: '15:15',
    total: 450,
    items: [
      { id: 1, name: 'Margherita Pizza', quantity: 1, price: 250, image: 'https://via.placeholder.com/80x80?text=Pizza' },
      { id: 2, name: 'Garlic Bread', quantity: 2, price: 80, image: 'https://via.placeholder.com/80x80?text=Bread' },
      { id: 3, name: 'Coke', quantity: 1, price: 40, image: 'https://via.placeholder.com/80x80?text=Coke' }
    ]
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered': return 'success';
    case 'Preparing': return 'warning';
    case 'Pending': return 'info';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

export default function OrderDetail() {
  const theme = useTheme();
  const { id } = useParams();
  const order = mockOrderDetails[id] || mockOrderDetails[1];

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconShoppingCartFilled size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Order Details
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Complete order information and items
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Fade in timeout={1000}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {order.orderNumber}
                  </Typography>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)}
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Order Items
                </Typography>
                
                <List sx={{ mb: 3 }}>
                  {order.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <Avatar 
                          src={item.image} 
                          sx={{ width: 60, height: 60, mr: 2, borderRadius: 2 }}
                          variant="rounded"
                        />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {item.name}
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                ₹{item.price * item.quantity}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Quantity: {item.quantity}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ₹{item.price} each
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < order.items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    ₹{order.total}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Fade in timeout={1200}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Customer Information
                  </Typography>
                  
                  <List sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <IconUser size={20} color={theme.palette.text.secondary} />
                      <ListItemText 
                        primary={order.customerName}
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <IconPhone size={20} color={theme.palette.text.secondary} />
                      <ListItemText 
                        primary={order.customerPhone}
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <IconMail size={20} color={theme.palette.text.secondary} />
                      <ListItemText 
                        primary={order.customerEmail}
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <IconMapPin size={20} color={theme.palette.text.secondary} />
                      <ListItemText 
                        primary={order.deliveryAddress}
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Fade>

            <Fade in timeout={1400}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Order Timeline
                  </Typography>
                  
                  <List sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <IconClock size={20} color={theme.palette.text.secondary} />
                      <ListItemText 
                        primary="Order Placed"
                        secondary={`${order.orderDate} at ${order.orderTime}`}
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                    {order.deliveryTime && (
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <IconClock size={20} color={theme.palette.success.main} />
                        <ListItemText 
                          primary="Delivered"
                          secondary={`${order.orderDate} at ${order.deliveryTime}`}
                          sx={{ ml: 2 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Fade>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}