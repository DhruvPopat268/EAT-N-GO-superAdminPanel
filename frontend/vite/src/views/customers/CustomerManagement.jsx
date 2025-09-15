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
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid
} from '@mui/material';
import { IconUsers, IconEye, IconPhone, IconMail, IconPrinter } from '@tabler/icons-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import BlackSpinner from 'ui-component/BlackSpinner';

const mockCustomers = [
  {
    id: 1,
    name: 'John Doe',
    phone: '+91 9876543210',
    email: 'john@example.com',
    orders: 15,
    totalAmount: 4500,
    joiningDate: '2024-01-15',
    status: true
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone: '+91 9876543211',
    email: 'jane@example.com',
    orders: 8,
    totalAmount: 2400,
    joiningDate: '2024-02-10',
    status: true
  },
  {
    id: 3,
    name: 'Bob Wilson',
    phone: '+91 9876543212',
    email: 'bob@example.com',
    orders: 22,
    totalAmount: 6800,
    joiningDate: '2023-12-05',
    status: false
  },
  {
    id: 4,
    name: 'Alice Brown',
    phone: '+91 9876543213',
    email: 'alice@example.com',
    orders: 5,
    totalAmount: 1200,
    joiningDate: '2024-03-01',
    status: true
  }
];

export default function CustomerManagement() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(mockCustomers);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    joiningDate: null,
    status: 'all',
    sortBy: 'newest'
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

    const filteredAndSortedCustomers = React.useMemo(() => {
    let filtered = [...customers];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(customer =>
        filters.status === 'active' ? customer.status : !customer.status
      );
    }

    // Filter by joining date
    if (filters.joiningDate) {
      const filterDate = filters.joiningDate.toISOString().split('T')[0];
      filtered = filtered.filter(customer => customer.joiningDate >= filterDate);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'orderCount':
          return b.orders - a.orders;
        case 'orderAmount':
          return b.totalAmount - a.totalAmount;
        case 'oldest':
          return new Date(a.joiningDate) - new Date(b.joiningDate);
        case 'newest':
        default:
          return new Date(b.joiningDate) - new Date(a.joiningDate);
      }
    });

    return filtered;
  }, [customers, filters]);

  if (loading) {
    return <BlackSpinner />;
  }

  const handleStatusToggle = (customerId) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId
        ? { ...customer, status: !customer.status }
        : customer
    ));
  };

  const handleView = (customerId) => {
    navigate(`/customer/detail/${customerId}`);
  };

  const handlePrint = (customerId) => {
    // Print customer details functionality
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };



  return (
    <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}
          >
            <IconUsers size={32} />
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
              Customer Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage and monitor customer accounts and activities
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 0, border: '1px solid #e0e0e0', overflow: 'hidden', background: 'white' }}>
        <Box sx={{ p: 4, borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Customer Database
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Filter and manage customer information
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Customer Joining Date"
                  value={filters.joiningDate}
                  onChange={(newValue) => setFilters({ ...filters, joiningDate: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small"
                    }
                  }}
                />

              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Customer Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Customer Status"
                  >
                    <MenuItem value="all">All Customers</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    label="Sort By"
                  >
                    <MenuItem value="newest">Sort by Newest</MenuItem>
                    <MenuItem value="oldest">Sort by Oldest</MenuItem>
                    <MenuItem value="orderCount">Sort by Order Count</MenuItem>
                    <MenuItem value="orderAmount">Sort by Order Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 700, py: 3, fontSize: '0.95rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Total Orders</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Total Order Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Joining Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedCustomers.map((customer) => (
                <TableRow key={customer.id} sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 52,
                          height: 52,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      >
                        {getInitials(customer.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {customer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Customer ID: #{customer.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconPhone size={16} color={theme.palette.text.secondary} />
                        <Typography variant="body2" fontWeight="500">
                          {customer.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconMail size={16} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary">
                          {customer.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography variant="h6" fontWeight="bold">
                      {customer.orders}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="h6" fontWeight="bold" >
                      ₹{customer.totalAmount.toLocaleString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {customer.joiningDate}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Switch
                      checked={customer.status}
                      onChange={() => handleStatusToggle(customer.id)}
                     
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Customer Details" arrow>
                        <IconButton
                          onClick={() => handleView(customer.id)}
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
                          <IconEye size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Customer Report" arrow>
                        <IconButton
                          onClick={() => handlePrint(customer.id)}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredAndSortedCustomers.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <IconUsers size={80} color={theme.palette.text.disabled} style={{ opacity: 0.5, marginBottom: 24 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
              No customers found
            </Typography>
            <Typography variant="body1" color="text.disabled">
              No customers match the selected filters
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}