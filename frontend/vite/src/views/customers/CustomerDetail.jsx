import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  useTheme,
  Fade,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { IconUser, IconPrinter, IconPhone, IconMail, IconMapPin, IconShoppingCart } from '@tabler/icons-react';

// Mock customer data
const mockCustomers = {
  1: { name: 'John Doe', phone: '+91 9876543210', email: 'john.doe@email.com', location: '123 Main St, Mumbai, Maharashtra' },
  2: { name: 'Jane Smith', phone: '+91 9876543211', email: 'jane.smith@email.com', location: '789 Park Avenue, Delhi, Delhi' },
  3: { name: 'Bob Wilson', phone: '+91 9876543212', email: 'bob.wilson@email.com', location: '321 Oak Street, Bangalore, Karnataka' },
  4: { name: 'Alice Brown', phone: '+91 9876543213', email: 'alice.brown@email.com', location: '654 Pine Road, Chennai, Tamil Nadu' },
  5: { name: 'Charlie Davis', phone: '+91 9876543214', email: 'charlie.davis@email.com', location: '987 Elm Street, Pune, Maharashtra' },
  6: { name: 'Eva Green', phone: '+91 9876543215', email: 'eva.green@email.com', location: '147 Maple Drive, Hyderabad, Telangana' },
  7: { name: 'Frank Miller', phone: '+91 9876543216', email: 'frank.miller@email.com', location: '258 Cedar Lane, Kolkata, West Bengal' },
  8: { name: 'Grace Lee', phone: '+91 9876543217', email: 'grace.lee@email.com', location: '369 Birch Street, Ahmedabad, Gujarat' }
};

// Mock customer orders data
const mockCustomerOrders = {
  1: [
    { id: 1, orderNumber: '#ORD001', status: 'Delivered', amount: 450 },
    { id: 9, orderNumber: '#ORD009', status: 'Pending', amount: 320 },
    { id: 10, orderNumber: '#ORD010', status: 'Preparing', amount: 280 }
  ],
  2: [
    { id: 2, orderNumber: '#ORD002', status: 'Pending', amount: 320 },
    { id: 11, orderNumber: '#ORD011', status: 'Delivered', amount: 450 }
  ],
  3: [
    { id: 3, orderNumber: '#ORD003', status: 'Preparing', amount: 680 },
    { id: 12, orderNumber: '#ORD012', status: 'Cancelled', amount: 200 }
  ],
  4: [
    { id: 4, orderNumber: '#ORD004', status: 'Delivered', amount: 280 },
    { id: 13, orderNumber: '#ORD013', status: 'Pending', amount: 350 },
    { id: 14, orderNumber: '#ORD014', status: 'Preparing', amount: 420 }
  ],
  5: [
    { id: 5, orderNumber: '#ORD005', status: 'Cancelled', amount: 520 },
    { id: 15, orderNumber: '#ORD015', status: 'Delivered', amount: 380 }
  ],
  6: [
    { id: 6, orderNumber: '#ORD006', status: 'Delivered', amount: 390 },
    { id: 16, orderNumber: '#ORD016', status: 'Pending', amount: 250 },
    { id: 17, orderNumber: '#ORD017', status: 'Preparing', amount: 480 }
  ],
  7: [
    { id: 7, orderNumber: '#ORD007', status: 'Preparing', amount: 150 },
    { id: 18, orderNumber: '#ORD018', status: 'Delivered', amount: 320 }
  ],
  8: [
    { id: 8, orderNumber: '#ORD008', status: 'Pending', amount: 720 },
    { id: 19, orderNumber: '#ORD019', status: 'Delivered', amount: 290 },
    { id: 20, orderNumber: '#ORD020', status: 'Cancelled', amount: 180 }
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

export default function CustomerDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const customerData = mockCustomers[id];
  const customerOrders = mockCustomerOrders[id] || [];
  const totalOrders = customerOrders.length;
  const totalAmount = customerOrders.reduce((sum, order) => sum + order.amount, 0);

  const handleViewOrder = (orderId) => {
    navigate(`/order-detail/${orderId}`);
  };

  const handlePrintOrder = (orderId) => {
    navigate(`/order-detail/${orderId}`);
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconUser size={32} color="black" />
            <Typography variant="h4" fontWeight="bold" color="black">
              Customer Details
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            View customer information and order history
          </Typography>
        </Box>
      </Fade>

      {/* Customer Info Card */}
      <Fade in timeout={900}>
        <Card sx={{ mb: 3, p: 3, borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Customer Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                {customerData?.name || 'Unknown Customer'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconPhone size={16} color="black" />
                <Typography variant="body2" color="black">
                  {customerData?.phone || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconMail size={16} color="black" />
                <Typography variant="body2" color="black">
                  {customerData?.email || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconMapPin size={16} color="black" />
                <Typography variant="body2" color="black">
                  {customerData?.location || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Stats Cards */}
      <Fade in timeout={1000}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconShoppingCart size={32} color="black" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="black">
                    {totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconUser size={32} color="black" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="black">
                    ₹{totalAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      <Fade in timeout={1100}>
        <Card sx={{ borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h6" fontWeight="bold">
              Order History
            </Typography>
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 700, py: 3 }}>Index</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">
                        No orders found for this customer
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  customerOrders.map((order, index) => (
                    <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: theme.palette.grey[25] } }}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="500">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="500">
                          {order.orderNumber}
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
                        <Typography variant="h6" fontWeight="bold">
                          ₹{order.amount}
                        </Typography>
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