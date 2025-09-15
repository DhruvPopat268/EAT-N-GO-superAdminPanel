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
  Grid,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  IconHistory,
  IconEye,
  IconPrinter,
  IconArrowUp,
  IconArrowDown,
  IconBuildingStore
} from '@tabler/icons-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import BlackSpinner from 'ui-component/BlackSpinner';

const mockTransactions = [
  {
    id: 1,
    type: 'order',
    orderId: 'ORD001',
    restaurantName: 'Pizza Palace',
    amount: 450,
    date: '2024-01-20',
    status: 'Credit',
    description: 'Order payment received'
  },
  {
    id: 2,
    type: 'withdrawal',
    orderId: 'WD001',
    restaurantName: 'Pizza Palace',
    amount: 15000,
    date: '2024-01-19',
    status: 'Debit',
    description: 'Withdrawal approved'
  },
  {
    id: 3,
    type: 'order',
    orderId: 'ORD002',
    restaurantName: 'Burger House',
    amount: 320,
    date: '2024-01-18',
    status: 'Credit',
    description: 'Order payment received'
  },
  {
    id: 4,
    type: 'withdrawal',
    orderId: 'WD002',
    restaurantName: 'Sushi World',
    amount: 8500,
    date: '2024-01-17',
    status: 'Debit',
    description: 'Withdrawal approved'
  }
];

const mockRestaurants = [
  { id: 1, name: 'Pizza Palace' },
  { id: 2, name: 'Burger House' },
  { id: 3, name: 'Sushi World' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Credit': return 'success';
    case 'Debit': return 'error';
    default: return 'default';
  }
};

export default function TransactionHistory() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [transactions] = useState(mockTransactions);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: null,
    restaurant: ''
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <BlackSpinner />;
  }

  const handleView = (transaction) => {
    if (transaction.type === 'order') {
      navigate(`/order/detail/${transaction.id}`);
    } else {
      navigate(`/payment/withdrawal-detail/${transaction.id}`);
    }
  };

  const handlePrint = (orderId) => {
    console.log('Print transaction:', orderId);
  };

  const filteredTransactions = transactions.filter(transaction => {
    let matches = true;
    
    if (filters.restaurant && transaction.restaurantName !== filters.restaurant) {
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
              Transaction History
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Complete transaction history including orders and withdrawals
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 0, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
        <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%)' }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            All Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            View all financial transactions including orders and withdrawals
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Transaction Date"
                  value={filters.date}
                  onChange={(newValue) => setFilters({ ...filters, date: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  size="small"
                  options={[{ id: 0, name: 'All Restaurants' }, ...mockRestaurants]}
                  getOptionLabel={(option) => option.name}
                  value={mockRestaurants.find(r => r.name === filters.restaurant) || { id: 0, name: 'All Restaurants' }}
                  onChange={(event, newValue) => {
                    setFilters({ ...filters, restaurant: newValue?.name === 'All Restaurants' ? '' : newValue?.name || '' });
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
                            <IconBuildingStore size={20} color={theme.palette.text.secondary} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                      <IconBuildingStore size={18} color={theme.palette.text.secondary} />
                      <Typography variant="body2">{option.name}</Typography>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Restaurant</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} sx={{ '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.02) } }}>
                  <TableCell sx={{ py: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" >
                      #{transaction.orderId}
                    </Typography>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {transaction.status === 'Credit' ? (
                        <IconArrowUp size={16}  />
                      ) : (
                        <IconArrowDown size={16} />
                      )}
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                       
                      >
                        ₹{transaction.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={transaction.status} 
                      
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {transaction.date}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.description}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details" arrow>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleView(transaction)}
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