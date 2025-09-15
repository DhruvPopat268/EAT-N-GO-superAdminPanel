import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { IconShoppingCartFilled, IconSearch, IconBuildingStore, IconPrinter } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const mockRestaurants = [
  { id: 1, name: 'Pizza Palace' },
  { id: 2, name: 'Burger House' },
  { id: 3, name: 'Sushi World' },
  { id: 4, name: 'Taco Bell' }
];

const mockOrders = {
  1: [
    { id: 1, orderNumber: '#ORD001', customerName: 'John Doe', items: 3, total: 450, status: 'Delivered', date: '2024-01-20', time: '14:30' },
    { id: 2, orderNumber: '#ORD002', customerName: 'Jane Smith', items: 2, total: 320, status: 'Pending', date: '2024-01-20', time: '15:45' },
    { id: 3, orderNumber: '#ORD003', customerName: 'Bob Wilson', items: 5, total: 680, status: 'Preparing', date: '2024-01-20', time: '16:20' }
  ],
  2: [
    { id: 4, orderNumber: '#ORD004', customerName: 'Alice Brown', items: 2, total: 280, status: 'Delivered', date: '2024-01-20', time: '12:15' },
    { id: 5, orderNumber: '#ORD005', customerName: 'Charlie Davis', items: 4, total: 520, status: 'Cancelled', date: '2024-01-20', time: '13:30' }
  ],
  3: [
    { id: 6, orderNumber: '#ORD006', customerName: 'Eva Green', items: 3, total: 390, status: 'Delivered', date: '2024-01-20', time: '11:45' },
    { id: 7, orderNumber: '#ORD007', customerName: 'Frank Miller', items: 1, total: 150, status: 'Preparing', date: '2024-01-20', time: '17:10' }
  ],
  4: [
    { id: 8, orderNumber: '#ORD008', customerName: 'Grace Lee', items: 6, total: 720, status: 'Pending', date: '2024-01-20', time: '18:00' }
  ]
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

export default function OrdersManagement() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleViewOrder = (orderId) => {
    navigate(`/order/detail/${orderId}`);
  };

  const handlePrintOrder = (orderId) => {
  };

  const filteredOrders = selectedRestaurant 
    ? (mockOrders[selectedRestaurant.id] || []).filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconShoppingCartFilled size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Orders Management
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            View and manage restaurant orders
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card 
          sx={{ 
            borderRadius: 0, 
            border: '1px solid #e0e0e0', 
            overflow: 'hidden',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb' }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Autocomplete
                sx={{ minWidth: 250 }}
                options={mockRestaurants}
                getOptionLabel={(option) => option.name}
                value={selectedRestaurant}
                onChange={(event, newValue) => setSelectedRestaurant(newValue)}
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

              {selectedRestaurant && (
                <TextField
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Stack>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!selectedRestaurant ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconBuildingStore size={48}  />
                        <Typography variant="h6" color="text.secondary">
                          Please select a restaurant first
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Choose a restaurant from the dropdown to view orders
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, index) => (
                    <Fade in timeout={1200 + index * 100} key={order.id}>
                      <TableRow sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'white', width: 40, height: 40 }}>
                              <IconShoppingCartFilled size={20} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {order.orderNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="500">
                            {order.customerName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${order.items} items`} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" fontWeight="bold">
                            ₹{order.total}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            color={getStatusColor(order.status)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="500">
                              {order.date}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.time}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Order Details" arrow>
                              <IconButton
                                onClick={() => handleViewOrder(order.id)}
                                sx={{ 
                                  color: 'primary.main',
                                  borderRadius: 1,
                                  '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    transform: 'scale(1.08)'
                                  }
                                }}
                              >
                                <Visibility sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Invoice" arrow>
                              <IconButton
                                onClick={() => handlePrintOrder(order.id)}
                                sx={{ 
                                  color: 'secondary.main',
                                  borderRadius: 1,
                                  '&:hover': {
                                    backgroundColor: 'secondary.main',
                                    color: 'white',
                                    transform: 'scale(1.08)'
                                  }
                                }}
                              >
                                <IconPrinter size={20} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Fade>
    </Box>
  );
}