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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  IconHistory,
  IconEye,
  IconPrinter,
  IconPhone,
  IconMail,
  IconBuildingStore,
  IconCreditCard
} from '@tabler/icons-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import BlackSpinner from 'ui-component/BlackSpinner';

const mockTransactions = [
  {
    id: 1,
    orderId: 'ORD001',
    customerName: 'John Doe',
    customerPhone: '+91 9876543210',
    customerEmail: 'john@example.com',
    restaurantName: 'Pizza Palace',
    amount: 450,
    paymentType: 'UPI',
    paymentStatus: 'Completed'
  },
  {
    id: 2,
    orderId: 'ORD002',
    customerName: 'Jane Smith',
    customerPhone: '+91 9876543211',
    customerEmail: 'jane@example.com',
    restaurantName: 'Burger House',
    amount: 320,
    paymentType: 'Cash',
    paymentStatus: 'Completed'
  },
  {
    id: 3,
    orderId: 'ORD003',
    customerName: 'Bob Wilson',
    customerPhone: '+91 9876543212',
    customerEmail: 'bob@example.com',
    restaurantName: 'Sushi World',
    amount: 680,
    paymentType: 'UPI',
    paymentStatus: 'Failed'
  }
];

const mockRestaurants = [
  { id: 1, name: 'Pizza Palace' },
  { id: 2, name: 'Burger House' },
  { id: 3, name: 'Sushi World' }
];

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Failed': return 'error';
    case 'Pending': return 'warning';
    default: return 'default';
  }
};

const getPaymentTypeColor = (type) => {
  switch (type) {
    case 'UPI': return 'primary';
    case 'Cash': return 'success';
    case 'Card': return 'info';
    default: return 'default';
  }
};

export default function OrderPaymentHistory() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [transactions] = useState(mockTransactions);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: null,
    restaurant: '',
    paymentType: ''
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BlackSpinner />;
  }

  const handleView = (orderId) => {
    navigate(`/order-detail/${orderId}`);
  };

  const handlePrint = (orderId) => {
    console.log('Print transaction:', orderId);
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const filteredTransactions = transactions.filter(transaction => {
    let matches = true;
    
    if (filters.restaurant && transaction.restaurantName !== filters.restaurant) {
      matches = false;
    }
    
    if (filters.paymentType && transaction.paymentType !== filters.paymentType) {
      matches = false;
    }
    
    return matches;
  });

  return (
    <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'info.main', 
              width: 64, 
              height: 64,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
            }}
          >
            <IconHistory size={32} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Order Payment History
            </Typography>
            <Typography variant="h6" color="text.secondary">
              View order payment transaction history
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden', background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%)' }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Payment Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Filter and view all payment transactions
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Transaction Date"
                  value={filters.date}
                  onChange={(newValue) => setFilters({ ...filters, date: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Restaurant</InputLabel>
                  <Select
                    value={filters.restaurant}
                    onChange={(e) => setFilters({ ...filters, restaurant: e.target.value })}
                    label="Restaurant"
                  >
                    <MenuItem value="">All Restaurants</MenuItem>
                    {mockRestaurants.map((restaurant) => (
                      <MenuItem key={restaurant.id} value={restaurant.name}>
                        {restaurant.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    value={filters.paymentType}
                    onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
                    label="Payment Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Customer Info</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Restaurant</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Payment Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Payment Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} sx={{ '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.02) } }}>
                  <TableCell sx={{ py: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      #{transaction.orderId}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40,
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getInitials(transaction.customerName)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {transaction.customerName}
                        </Typography>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconPhone size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {transaction.customerPhone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconMail size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {transaction.customerEmail}
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
                        {transaction.restaurantName}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="h6" fontWeight="bold">
                      ₹{transaction.amount}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      icon={<IconCreditCard size={16} />}
                      label={transaction.paymentType} 
                      // color={getPaymentTypeColor(transaction.paymentType)}
                      // variant="outlined"
                      // size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={transaction.paymentStatus} 
                      // color={getPaymentStatusColor(transaction.paymentStatus)}
                      variant="filled"
                      // size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Order Details" arrow>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleView(transaction.id)}
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
                      <Tooltip title="Print Transaction" arrow>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handlePrint(transaction.orderId)}
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

        {filteredTransactions.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <IconHistory size={80} color={theme.palette.text.disabled} style={{ opacity: 0.5, marginBottom: 24 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
              No transactions found
            </Typography>
            <Typography variant="body1" color="text.disabled">
              No transactions match the selected filters
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}