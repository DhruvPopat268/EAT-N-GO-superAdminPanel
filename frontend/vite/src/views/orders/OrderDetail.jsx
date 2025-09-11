import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Divider,
  useTheme,
  Fade,
  Grid , 
  IconButton,
} from '@mui/material';
import { IconShoppingCartFilled, IconArrowLeft, IconUser, IconBuildingStore, IconPhone, IconMail, IconMapPin, IconPrinter  } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// Mock data for order details
const mockOrderDetails = {
  1: {
    orderNumber: '#ORD001',
    customerName: 'John Doe',
    customerPhone: '+91 9876543210',
    customerEmail: 'john.doe@email.com',
    customerLocation: '123 Main St, Mumbai, Maharashtra',
    restaurant: 'Pizza Palace',
    restaurantLocation: '456 Food Street, Mumbai, Maharashtra',
    status: 'Delivered',
    date: '2024-01-20',
    time: '14:30',
    items: [
      {
        id: 1,
        name: 'Margherita Pizza',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
        quantity: 2,
        price: 180
      },
      {
        id: 2,
        name: 'Garlic Bread',
        image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=100&h=100&fit=crop',
        quantity: 1,
        price: 90
      }
    ]
  },
  2: {
    orderNumber: '#ORD002',
    customerName: 'Jane Smith',
    customerPhone: '+91 9876543211',
    customerEmail: 'jane.smith@email.com',
    customerLocation: '789 Park Avenue, Delhi, Delhi',
    restaurant: 'Pizza Palace',
    restaurantLocation: '456 Food Street, Mumbai, Maharashtra',
    status: 'Pending',
    date: '2024-01-20',
    time: '15:45',
    items: [
      {
        id: 3,
        name: 'Pepperoni Pizza',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=100&h=100&fit=crop',
        quantity: 1,
        price: 220
      },
      {
        id: 4,
        name: 'Caesar Salad',
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=100&h=100&fit=crop',
        quantity: 1,
        price: 100
      }
    ]
  },
  3: {
    orderNumber: '#ORD003',
    customerName: 'Bob Wilson',
    customerPhone: '+91 9876543212',
    customerEmail: 'bob.wilson@email.com',
    customerLocation: '321 Oak Street, Bangalore, Karnataka',
    restaurant: 'Burger House',
    restaurantLocation: '789 Burger Lane, Bangalore, Karnataka',
    status: 'Preparing',
    date: '2024-01-20',
    time: '16:20',
    items: [
      {
        id: 5,
        name: 'Classic Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
        quantity: 2,
        price: 150
      },
      {
        id: 6,
        name: 'French Fries',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=100&h=100&fit=crop',
        quantity: 2,
        price: 80
      },
      {
        id: 7,
        name: 'Coke',
        image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=100&h=100&fit=crop',
        quantity: 2,
        price: 50
      }
    ]
  },
  4: {
    orderNumber: '#ORD004',
    customerName: 'Alice Brown',
    customerPhone: '+91 9876543213',
    customerEmail: 'alice.brown@email.com',
    customerLocation: '654 Pine Road, Chennai, Tamil Nadu',
    restaurant: 'Sushi World',
    restaurantLocation: '123 Sushi Plaza, Chennai, Tamil Nadu',
    status: 'Delivered',
    date: '2024-01-20',
    time: '12:15',
    items: [
      {
        id: 8,
        name: 'Salmon Roll',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop',
        quantity: 1,
        price: 180
      },
      {
        id: 9,
        name: 'Miso Soup',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=100&h=100&fit=crop',
        quantity: 1,
        price: 100
      }
    ]
  },
  5: {
    orderNumber: '#ORD005',
    customerName: 'Charlie Davis',
    customerPhone: '+91 9876543214',
    customerEmail: 'charlie.davis@email.com',
    customerLocation: '987 Elm Street, Pune, Maharashtra',
    restaurant: 'Taco Bell',
    restaurantLocation: '555 Taco Avenue, Pune, Maharashtra',
    status: 'Cancelled',
    date: '2024-01-20',
    time: '13:30',
    items: [
      {
        id: 10,
        name: 'Chicken Tacos',
        image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6c84?w=100&h=100&fit=crop',
        quantity: 3,
        price: 120
      },
      {
        id: 11,
        name: 'Nachos',
        image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=100&h=100&fit=crop',
        quantity: 1,
        price: 160
      }
    ]
  },
  6: {
    orderNumber: '#ORD006',
    customerName: 'Eva Green',
    customerPhone: '+91 9876543215',
    customerEmail: 'eva.green@email.com',
    customerLocation: '147 Maple Drive, Hyderabad, Telangana',
    restaurant: 'Pizza Palace',
    restaurantLocation: '456 Food Street, Mumbai, Maharashtra',
    status: 'Delivered',
    date: '2024-01-20',
    time: '11:45',
    items: [
      {
        id: 12,
        name: 'Veggie Pizza',
        image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=100&h=100&fit=crop',
        quantity: 1,
        price: 200
      },
      {
        id: 13,
        name: 'Chicken Wings',
        image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=100&h=100&fit=crop',
        quantity: 1,
        price: 190
      }
    ]
  },
  7: {
    orderNumber: '#ORD007',
    customerName: 'Frank Miller',
    customerPhone: '+91 9876543216',
    customerEmail: 'frank.miller@email.com',
    customerLocation: '258 Cedar Lane, Kolkata, West Bengal',
    restaurant: 'Burger House',
    restaurantLocation: '789 Burger Lane, Bangalore, Karnataka',
    status: 'Preparing',
    date: '2024-01-20',
    time: '17:10',
    items: [
      {
        id: 14,
        name: 'Double Cheeseburger',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&h=100&fit=crop',
        quantity: 1,
        price: 150
      }
    ]
  },
  8: {
    orderNumber: '#ORD008',
    customerName: 'Grace Lee',
    customerPhone: '+91 9876543217',
    customerEmail: 'grace.lee@email.com',
    customerLocation: '369 Birch Street, Ahmedabad, Gujarat',
    restaurant: 'Sushi World',
    restaurantLocation: '123 Sushi Plaza, Chennai, Tamil Nadu',
    status: 'Pending',
    date: '2024-01-20',
    time: '18:00',
    items: [
      {
        id: 15,
        name: 'Dragon Roll',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=100&h=100&fit=crop',
        quantity: 2,
        price: 250
      },
      {
        id: 16,
        name: 'California Roll',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop',
        quantity: 1,
        price: 180
      },
      {
        id: 17,
        name: 'Edamame',
        image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=100&h=100&fit=crop',
        quantity: 1,
        price: 40
      }
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
  const navigate = useNavigate();
  const { id } = useParams();
  
  const orderData = mockOrderDetails[id];

  const handlePrint = () => {
    window.print();
  };

  if (!orderData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Order not found
        </Typography>
      </Box>
    );
  }

  const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconShoppingCartFilled size={32} color={theme.palette.primary.main} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Order Details
              </Typography>
            </Box>
            <IconButton
              onClick={handlePrint}
              sx={{ 
                color: 'primary.main',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              <IconPrinter size={24} />
            </IconButton>
          </Box>
          <Typography variant="body1" color="text.secondary">
            View detailed information about the order
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card sx={{ borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {/* Order Header */}
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                  {orderData.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {orderData.date} at {orderData.time}
                </Typography>
              </Box>
              <Chip 
                label={orderData.status} 
                color={getStatusColor(orderData.status)}
                variant="outlined"
                size="medium"
              />
            </Box>
          </Box>

          {/* Customer and Restaurant Info */}
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Grid container spacing={4}>
              {/* Customer Info */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <IconUser size={24} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight="bold">
                    Customer Information
                  </Typography>
                </Box>
                <Box sx={{ pl: 4 }}>
                  <Typography variant="body1" fontWeight="500" sx={{ mb: 1 }}>
                    {orderData.customerName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <IconPhone size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary">
                      {orderData.customerPhone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <IconMail size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary">
                      {orderData.customerEmail}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconMapPin size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary">
                      {orderData.customerLocation}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Restaurant Info */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <IconBuildingStore size={24} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight="bold">
                    Restaurant Information
                  </Typography>
                </Box>
                <Box sx={{ pl: 4 }}>
                  <Typography variant="body1" fontWeight="500" sx={{ mb: 1 }}>
                    {orderData.restaurant}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconMapPin size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary">
                      {orderData.restaurantLocation}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Order Items Table */}
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Index</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderData.items.map((item, index) => (
                  <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: theme.palette.grey[25] } }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500">
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={item.image}
                        alt={item.name}
                        sx={{ width: 60, height: 60, borderRadius: 2 }}
                        variant="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                   {item.quantity} 
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="600">
                        ₹{item.price * item.quantity}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total Amount */}
          <Box sx={{ p: 4, borderTop: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Total Amount
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  ₹{totalAmount}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      </Fade>
    </Box>
  );
}