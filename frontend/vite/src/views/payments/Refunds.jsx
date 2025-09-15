import React, { useState } from 'react';
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
  Stack,
  alpha,
  useTheme,
  Button,
  Tooltip,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  IconRefresh,
  IconEye,
  IconPrinter,
  IconPhone,
  IconMail,
  IconMapPin,
  IconBuildingStore,
  IconSearch
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import BlackSpinner from 'ui-component/BlackSpinner';

const mockRefunds = [
  {
    id: 1,
    orderId: 'ORD001',
    orderDate: '2024-01-20',
    customerName: 'John Doe',
    customerPhone: '+91 9876543210',
    customerEmail: 'john@example.com',
    restaurantName: 'Pizza Palace',
    totalAmount: 450,
    orderStatus: 'Refunded'
  },
  {
    id: 2,
    orderId: 'ORD002',
    orderDate: '2024-01-19',
    customerName: 'Jane Smith',
    customerPhone: '+91 9876543211',
    customerEmail: 'jane@example.com',
    restaurantName: 'Burger House',
    totalAmount: 320,
    orderStatus: 'Pending'
  },
  {
    id: 3,
    orderId: 'ORD003',
    orderDate: '2024-01-18',
    customerName: 'Bob Wilson',
    customerPhone: '+91 9876543212',
    customerEmail: 'bob@example.com',
    restaurantName: 'Sushi World',
    totalAmount: 680,
    orderStatus: 'Refunded'
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Refunded': return 'success';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

export default function Refunds() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [refunds] = useState(mockRefunds);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BlackSpinner />;
  }

  const handleView = (orderId) => {
    navigate(`/order/detail/${orderId}`);
  };

  const handlePrint = (orderId) => {
    console.log('Print refund:', orderId);
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const filteredRefunds = refunds.filter(refund =>
    refund.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white', 
              width: 64, 
              height: 64,
            }}
          >
            <IconRefresh size={32} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Refunds Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Track and manage order refunds and cancellations
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 0, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
        <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, rgba(255, 154, 158, 0.05) 0%, rgba(254, 207, 239, 0.05) 100%)' }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Refund Orders
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            View and manage refunded and cancelled orders
          </Typography>
          
          <TextField
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ maxWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Order Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Customer Information</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Restaurant</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Order Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRefunds.map((refund) => (
                <TableRow key={refund.id} sx={{ '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.02) } }}>
                  <TableCell sx={{ py: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" >
                      #{refund.orderId}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {refund.orderDate}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'white',
                          width: 40,
                          height: 40,
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getInitials(refund.customerName)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {refund.customerName}
                        </Typography>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconPhone size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {refund.customerPhone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconMail size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {refund.customerEmail}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <IconBuildingStore size={18} color={theme.palette.text.secondary} />
                      <Typography variant="body2" fontWeight="500">
                        {refund.restaurantName}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="h6" fontWeight="bold" >
                      ₹{refund.totalAmount}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={refund.orderStatus} 
                      
                      // variant="filled"
                      // size="small"
                      // sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Order Details" arrow>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleView(refund.id)}
                          sx={{ 
                            minWidth: 40,
                            height: 40,
                            borderRadius: 2,
                            '&:hover': {
                              transform: 'scale(1.08)',
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <IconEye size={18} />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Print Refund" arrow>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handlePrint(refund.orderId)}
                          sx={{ 
                            minWidth: 40,
                            height: 40,
                            borderRadius: 2,
                            '&:hover': {
                              transform: 'scale(1.08)',
                              backgroundColor: 'secondary.main',
                              color: 'white'
                            }
                          }}
                        >
                          <IconPrinter size={18} />
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRefunds.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <IconRefresh size={80} color={theme.palette.text.disabled} style={{ opacity: 0.5, marginBottom: 24 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
              No refunds found
            </Typography>
            <Typography variant="body1" color="text.disabled">
              {searchTerm ? 'No refunds match your search criteria' : 'No refunded orders to display'}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}